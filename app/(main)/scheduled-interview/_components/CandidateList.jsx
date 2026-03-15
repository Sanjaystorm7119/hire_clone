"use client";
import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
} from "../../../../frontend/components/ui/card";
import moment from "moment";
import CandidateFeedbackDialogBox from "./CandidateFeedbackDialogBox";

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function CandidateList({ CandidateDetails }) {
  const [minRating, setMinRating] = useState(1);
  const [maxRating, setMaxRating] = useState(10);

  const getRating = (candidate) => {
    const val = candidate?.feedback?.feedback?.rating?.OverallRating;
    return val != null ? parseInt(val) : null;
  };

  const filtered = useMemo(() => {
    if (!CandidateDetails) return [];
    return CandidateDetails.filter((c) => {
      const r = getRating(c);
      if (r == null) return true; // no rating yet — always show
      return r >= minRating && r <= maxRating;
    });
  }, [CandidateDetails, minRating, maxRating]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg font-semibold">
            Candidate List ({filtered.length}
            {filtered.length !== (CandidateDetails?.length ?? 0) && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                of {CandidateDetails?.length ?? 0}
              </span>
            )}
            )
          </CardTitle>

          {/* Rating filter */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium whitespace-nowrap">
              Rating:
            </span>

            <select
              value={minRating}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinRating(val);
                if (val > maxRating) setMaxRating(val);
              }}
              className="border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              {RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <span className="text-muted-foreground">–</span>

            <select
              value={maxRating}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMaxRating(val);
                if (val < minRating) setMinRating(val);
              }}
              className="border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              {RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {(minRating !== 1 || maxRating !== 10) && (
              <button
                onClick={() => { setMinRating(1); setMaxRating(10); }}
                className="text-xs text-blue-600 hover:underline whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <div className="px-4 pb-4">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((candidate, index) => {
              const rating = getRating(candidate);
              return (
                <div
                  key={`candidate-${candidate.userEmail || index}-${candidate.created_at || index}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold">
                      {candidate.userName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {candidate.userName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Completed on:{" "}
                        {moment(candidate.created_at).format("MMM DD, YYYY")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`text-lg font-semibold ${
                          rating == null
                            ? "text-gray-400"
                            : rating < 5
                            ? "text-red-600"
                            : rating === 5
                            ? "text-gray-600"
                            : "text-green-600"
                        }`}
                      >
                        {rating != null ? `${rating}/10` : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                    <CandidateFeedbackDialogBox candidate={candidate} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {CandidateDetails?.length > 0 ? (
              <p>No candidates match rating {minRating}–{maxRating}.</p>
            ) : (
              <p>No candidates found</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default CandidateList;
