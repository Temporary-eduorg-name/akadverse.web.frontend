import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

const ENV_PATH = path.resolve(process.cwd(), '.env');

function readEnvValue(fileText, key) {
  const regex = new RegExp(`^\\s*${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?\\s*$`, 'm');
  const match = fileText.match(regex);
  return match ? match[1].trim() : null;
}

function parseMysqlUrl(rawUrl, label) {
  if (!rawUrl) {
    throw new Error(`Missing ${label} connection string.`);
  }

  const url = new URL(rawUrl);
  return {
    host: url.hostname,
    port: Number(url.port || '3306'),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    multipleStatements: true,
    charset: 'utf8mb4',
  };
}

function getTableNames(rows) {
  return rows.map((row) => {
    const firstKey = Object.keys(row)[0];
    return row[firstKey];
  });
}

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date || Buffer.isBuffer(value)) {
    return value;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
}

async function getRowCount(conn, table) {
  const [rows] = await conn.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
  return Number(rows[0]?.count || 0);
}

async function copyTable(sourceConn, targetConn, sourceTable, targetTable) {
  const [rows] = await sourceConn.query(`SELECT * FROM \`${sourceTable}\``);

  await targetConn.query(`TRUNCATE TABLE \`${targetTable}\``);

  if (!rows.length) {
    return { copied: 0 };
  }

  const columns = Object.keys(rows[0]);
  const columnList = columns.map((col) => `\`${col}\``).join(', ');
  const placeholders = `(${columns.map(() => '?').join(', ')})`;
  const chunkSize = 250;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const valuePlaceholders = chunk.map(() => placeholders).join(', ');
    const values = chunk.flatMap((row) => columns.map((col) => normalizeValue(row[col])));
    const sql = `INSERT INTO \`${targetTable}\` (${columnList}) VALUES ${valuePlaceholders}`;
    await targetConn.query(sql, values);
  }

  return { copied: rows.length };
}

async function main() {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error('.env file not found in project root.');
  }

  const envText = fs.readFileSync(ENV_PATH, 'utf8');
  const localUrl = readEnvValue(envText, 'DATABASE_URL');
  const railwayUrl = readEnvValue(envText, 'DATABASE_PUBLIC_URL');

  const sourceConfig = parseMysqlUrl(localUrl, 'DATABASE_URL');
  const targetConfig = parseMysqlUrl(railwayUrl, 'DATABASE_PUBLIC_URL');

  const sourceConn = await mysql.createConnection(sourceConfig);
  const targetConn = await mysql.createConnection(targetConfig);

  try {
    const [sourceTableRows] = await sourceConn.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
    const [targetTableRows] = await targetConn.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
    const sourceTables = getTableNames(sourceTableRows);
    const targetTables = getTableNames(targetTableRows);
    const targetByLower = new Map(targetTables.map((table) => [table.toLowerCase(), table]));

    const tables = sourceTables
      .filter((sourceTable) => targetByLower.has(sourceTable.toLowerCase()))
      .map((sourceTable) => ({
        sourceTable,
        targetTable: targetByLower.get(sourceTable.toLowerCase()),
      }));

    const missingInTarget = sourceTables.filter(
      (sourceTable) => !targetByLower.has(sourceTable.toLowerCase()),
    );

    if (!sourceTables.length) {
      console.log('No tables found in local database. Nothing to transfer.');
      return;
    }

    if (!tables.length) {
      throw new Error('No overlapping tables between local and Railway databases.');
    }

    console.log(`Found ${sourceTables.length} local tables.`);
    console.log(`Copying ${tables.length} tables present in Railway...`);
    if (missingInTarget.length) {
      console.log(`Skipping ${missingInTarget.length} table(s) missing in Railway: ${missingInTarget.join(', ')}`);
    }

    await targetConn.query('SET FOREIGN_KEY_CHECKS = 0');

    const summary = [];

    for (const { sourceTable, targetTable } of tables) {
      const sourceCountBefore = await getRowCount(sourceConn, sourceTable);
      const { copied } = await copyTable(sourceConn, targetConn, sourceTable, targetTable);
      const targetCountAfter = await getRowCount(targetConn, targetTable);

      summary.push({
        table: `${sourceTable} -> ${targetTable}`,
        sourceCount: sourceCountBefore,
        copied,
        targetCount: targetCountAfter,
      });

      console.log(`- ${sourceTable} -> ${targetTable}: source=${sourceCountBefore}, copied=${copied}, target=${targetCountAfter}`);
    }

    await targetConn.query('SET FOREIGN_KEY_CHECKS = 1');

    const mismatches = summary.filter((item) => item.sourceCount !== item.targetCount);

    if (mismatches.length) {
      console.log('\nTransfer completed with mismatches:');
      for (const mismatch of mismatches) {
        console.log(
          `  * ${mismatch.table}: source=${mismatch.sourceCount}, target=${mismatch.targetCount}`,
        );
      }
      process.exitCode = 1;
      return;
    }

    console.log('\nTransfer completed successfully. All table row counts match.');
  } finally {
    try {
      await targetConn.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch {
      // Ignore cleanup errors.
    }
    await sourceConn.end();
    await targetConn.end();
  }
}

main().catch((error) => {
  console.error('Transfer failed:', error.message);
  process.exit(1);
});
