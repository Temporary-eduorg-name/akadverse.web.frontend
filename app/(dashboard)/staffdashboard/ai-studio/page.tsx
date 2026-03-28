import DashboardNavbar from "@/app/components/dashboard/staff/DashboardNavbar";
import { 
  Bot, BookOpen, Calendar, FileText, Layout, Lightbulb, 
  Network, Headphones, SquarePlay, HelpCircle, PenTool,
  MessageSquare, Upload, Mic, Send, Paperclip, ChevronLeft,
  CheckCircle, FileSpreadsheet, FileBox
} from 'lucide-react';
import React from "react";
type AITool = {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  colorClass: string;
  hoverAnimType: 'pulse' | 'flip' | 'slide' | 'breathe' | 'bounce' | 'wave' | 'ripple';
};
const FACULTY_TOOLS: AITool[] = [
    // Virtual Assistants
    { id: 'f-va-1', name: 'Faculty Virtual Assistant', description: 'Helps faculty manage academic workflows and classes.', icon: Bot, category: 'Virtual Assistant', colorClass: 'text-indigo-500 bg-indigo-50 border-indigo-100', hoverAnimType: 'breathe' },
    { id: 'f-va-2', name: 'Teaching Virtual Assistant', description: 'Helps prepare lecture materials and explain topics.', icon: BookOpen, category: 'Virtual Assistant', colorClass: 'text-purple-500 bg-purple-50 border-purple-100', hoverAnimType: 'slide' },
    // Productivity
    { id: 'f-p-1', name: 'Workspace Integration AI', description: 'Interact with your docs, sheets, and files using AI.', icon: FileBox, category: 'Productivity AI', colorClass: 'text-blue-500 bg-blue-50 border-blue-100', hoverAnimType: 'slide' },
    { id: 'f-p-2', name: 'Schedule Manager AI', description: 'AI planner for managing study time and schedules.', icon: Calendar, category: 'Productivity AI', colorClass: 'text-emerald-500 bg-emerald-50 border-emerald-100', hoverAnimType: 'flip' },
    // Teaching AI Tools
    { id: 'f-t-1', name: 'Note Creator', description: 'Generate structured lecture notes.', icon: FileText, category: 'Teaching AI Tools', colorClass: 'text-rose-500 bg-rose-50 border-rose-100', hoverAnimType: 'slide' },
    { id: 'f-t-2', name: 'Slide Creator', description: 'Create presentation slides automatically.', icon: Layout, category: 'Teaching AI Tools', colorClass: 'text-amber-500 bg-amber-50 border-amber-100', hoverAnimType: 'slide' },
    { id: 'f-t-3', name: 'External Resource Puller', description: 'Find academic papers and resources.', icon: Network, category: 'Teaching AI Tools', colorClass: 'text-cyan-500 bg-cyan-50 border-cyan-100', hoverAnimType: 'pulse' },
    { id: 'f-t-4', name: 'Assignment Generator', description: 'Create comprehensive assignments.', icon: FileText, category: 'Teaching AI Tools', colorClass: 'text-teal-500 bg-teal-50 border-teal-100', hoverAnimType: 'slide' },
    { id: 'f-t-5', name: 'Sample Question Generator', description: 'Draft exam and quiz questions.', icon: HelpCircle, category: 'Teaching AI Tools', colorClass: 'text-violet-500 bg-violet-50 border-violet-100', hoverAnimType: 'bounce' },
    // Operational
    { id: 'f-o-1', name: 'Attendance AI', description: 'Helps automate attendance processing.', icon: CheckCircle, category: 'Operational AI', colorClass: 'text-sky-500 bg-sky-50 border-sky-100', hoverAnimType: 'ripple' },
    { id: 'f-o-2', name: 'Test & Grading Upload AI', description: 'Upload grade sheets and process scores.', icon: FileSpreadsheet, category: 'Operational AI', colorClass: 'text-lime-500 bg-lime-50 border-lime-100', hoverAnimType: 'slide' },
];
export default function StaffAIStudio() {
    return (
        <div>
            <DashboardNavbar />
            <main className="max-w-5xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-6">AI Studio</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FACULTY_TOOLS.map((tool) => (
                        <div
                            key={tool.id}
                            className={`rounded-xl border p-6 shadow bg-white flex flex-col gap-2 ${tool.colorClass.replace(/dark:[^ ]+ ?/g, '')}`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <tool.icon className="w-7 h-7" />
                                <span className="font-semibold text-lg">{tool.name}</span>
                            </div>
                            <p className="text-sm text-gray-700">{tool.description}</p>
                            <span className="text-xs mt-2 inline-block bg-gray-100 px-2 py-1 rounded">{tool.category}</span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
