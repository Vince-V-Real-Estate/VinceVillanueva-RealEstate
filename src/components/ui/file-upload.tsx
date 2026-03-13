"use client";

import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { type UploadRouter } from "@/app/api/uploadthing/core";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  endpoint: keyof UploadRouter;
  onUploadComplete: (res: { url: string; name: string }[]) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

export function FileUpload({
  endpoint,
  onUploadComplete,
  onUploadError,
  className,
}: FileUploadProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop View: Dropzone */}
      <div className="hidden md:block">
        <UploadDropzone
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            if (res) {
              onUploadComplete(res);
            }
          }}
          onUploadError={(error: Error) => {
            if (onUploadError) {
              onUploadError(error);
            } else {
              console.error(error);
              alert(`Upload failed: ${error.message}`);
            }
          }}
          appearance={{
            container:
              "border-2 border-dashed border-input rounded-lg p-8 bg-muted/50 hover:bg-muted/80 transition-colors w-full h-64 flex flex-col justify-center items-center gap-4 cursor-pointer",
            uploadIcon: "text-muted-foreground w-12 h-12 mb-2",
            label: "text-foreground font-medium text-lg hover:text-primary",
            allowedContent: "text-muted-foreground text-xs",
            button:
              "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors mt-4",
          }}
          content={{
            uploadIcon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground/50 h-10 w-10"
              >
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
            ),
          }}
        />
      </div>

      {/* Mobile/Tablet View: Button */}
      <div className="block md:hidden">
        <UploadButton
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            if (res) {
              onUploadComplete(res);
            }
          }}
          onUploadError={(error: Error) => {
            if (onUploadError) {
              onUploadError(error);
            } else {
              console.error(error);
              alert(`Upload failed: ${error.message}`);
            }
          }}
          appearance={{
            button:
              "w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-md text-sm font-medium transition-colors shadow-sm",
            container: "w-full flex flex-col items-center gap-2",
            allowedContent: "text-muted-foreground text-xs text-center",
          }}
        />
      </div>
    </div>
  );
}
