"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function ReviewsComponent() {
  const params = useParams();
  const businessId = params.id as string;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [businessId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/reviews`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      
      if (data.reviews && data.reviews.length > 0) {
        const avg =
          data.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) /
          data.reviews.length;
        setAverageRating(avg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Average Rating Summary */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Average Rating
            </p>
            <p className="text-4xl font-bold text-zinc-900 dark:text-white">
              {averageRating.toFixed(1)} ⭐
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => r.rating === rating).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-12 text-sm text-zinc-600 dark:text-zinc-400">
                    {rating} ⭐
                  </span>
                  <div className="w-48 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-zinc-600 dark:text-zinc-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No reviews yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? "text-yellow-500" : "text-zinc-300 dark:text-zinc-600"}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>

              {review.comment && (
                <p className="text-zinc-700 dark:text-zinc-300">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
