interface ProductDetailCallbacks<TResponse> {
  onLoadStart: (id: string) => void;
  onLoadEnd: () => void;
  onSuccess: (data: TResponse) => void;
  onError: (error: unknown) => void;
}

export async function handleViewProductDetails<TResponse>(
  productId: string,
  e: React.MouseEvent,
  callbacks: ProductDetailCallbacks<TResponse>
) {
  e.preventDefault();
  e.stopPropagation();
  callbacks.onLoadStart(productId);

  try {
    const response = await fetch(`/api/marketplace/products/${productId}/details`);
    if (response.ok) {
      const data: TResponse = await response.json();
      callbacks.onSuccess(data);
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    callbacks.onError(error);
  } finally {
    callbacks.onLoadEnd();
  }
}

