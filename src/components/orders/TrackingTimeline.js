import React, { memo } from 'react';

// Vertical tracking timeline component
// Props:
// - steps: [{ key, label, status, timestamp }]
// - className
const TrackingTimeline = ({ steps = [], className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {steps.map((s, idx) => {
        const stateClass = s.status === 'completed'
          ? 'bg-green-100 text-green-700 '
          : s.status === 'active'
          ? 'bg-emerald-100 text-emerald-700 animate-pulse '
          : 'bg-gray-100 text-gray-400 ';

        return (
          <div key={s.key} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stateClass}`.trim()}>
                {s.status === 'completed' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{idx + 1}</span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-px h-6 ${s.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'} mt-1`} />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <h4 className={`text-sm font-semibold ${s.status === 'completed' ? 'text-green-700' : s.status === 'active' ? 'text-emerald-700' : 'text-gray-600'}`}>
                  {s.label}
                </h4>
                <p className="text-xs text-gray-400">
                  {s.timestamp ? new Date(s.timestamp).toLocaleString('en-IN') : ''}
                </p>
              </div>
              <p className={`text-xs mt-1 ${s.status === 'completed' ? 'text-green-600' : s.status === 'active' ? 'text-emerald-700' : 'text-gray-500'}`}>
                {s.status === 'completed' ? 'Completed' : s.status === 'active' ? 'In progress' : 'Pending'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(TrackingTimeline);
