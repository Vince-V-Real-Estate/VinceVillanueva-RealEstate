"use client";

import { LeadCaptureForm } from "@/components/forms/lead-capture";

export function HomeValuation() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-16 md:py-24 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-size-[16px_16px] opacity-20" />

      <div className="relative container mx-auto px-4 md:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <span className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
                Market Insights
              </span>
              <h2 className="text-4xl font-light tracking-tight text-gray-900 sm:text-6xl">
                What is your <br />
                <span className="font-serif text-black italic">
                  home worth?
                </span>
              </h2>
              <p className="max-w-150 text-lg leading-relaxed text-gray-600">
                Receive a comprehensive valuation report tailored to your
                property&apos;s unique features and current market conditions.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                "Instant Preliminary Estimate",
                "Comparative Market Analysis",
                "Expert Strategic Advice",
              ].map((item, i) => (
                <div key={i} className="group flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:scale-110">
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="text-base font-medium text-gray-800">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-gray-200 to-gray-100 opacity-30 blur" />
              <div className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="mb-8 space-y-1 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Get Your Report
                  </h3>
                  <p className="text-sm text-gray-500">
                    Enter details below to start
                  </p>
                </div>
                <LeadCaptureForm type="valuation" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
