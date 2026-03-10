"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLogger } from "@/lib/logger";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

const log = createLogger("lead-capture");

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  message: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LeadCaptureFormProps {
  type: "listings" | "valuation" | "call" | "contact";
  className?: string;
  onSuccess?: () => void;
}

export function LeadCaptureForm({
  type,
  className,
  onSuccess,
}: LeadCaptureFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      address: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.name,
          email: data.email,
          phone: data.phone === "" ? undefined : data.phone,
          message: data.message === "" ? undefined : data.message,
          address: data.address === "" ? undefined : data.address,
          source: type,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
        lead?: { id: string };
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to submit form");
      }

      log.info("Lead captured", { type, id: result.lead?.id });
      reset();
      if (onSuccess) onSuccess();
      alert(result.message ?? "Request received! We will be in touch shortly.");
    } catch (error) {
      log.error("Failed to submit lead form", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const getButtonText = () => {
    switch (type) {
      case "listings":
        return "Join Exclusive List";
      case "valuation":
        return "Get Valuation Report";
      case "call":
        return "Book Consultation";
      case "contact":
        return "Send Message";
      default:
        return "Submit Request";
    }
  };

  const inputClasses = (fieldName: string, hasError: boolean) =>
    cn(
      "w-full bg-transparent border-b-2 py-3 px-1 text-base outline-none transition-all duration-300 placeholder:text-gray-400",
      hasError
        ? "border-red-400 text-red-900 placeholder:text-red-300"
        : focusedField === fieldName
          ? "border-black/80"
          : "border-gray-200 hover:border-gray-300",
    );

  const labelClasses = (fieldName: string) =>
    cn(
      "absolute left-1 transition-all duration-300 pointer-events-none text-sm font-medium tracking-wide uppercase",
      focusedField === fieldName ||
        form.getValues(fieldName as keyof FormValues)
        ? "-top-5 text-xs text-black/60"
        : "top-3 text-gray-400",
    );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("mt-2 space-y-8", className)}
    >
      <div className="space-y-6">
        {/* Name Field */}
        <div className="group relative">
          <label htmlFor="name" className={labelClasses("name")}>
            Full Name
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            onFocus={() => setFocusedField("name")}
            onBlur={async (e) => {
              await register("name").onBlur(e);
              setFocusedField(null);
            }}
            className={inputClasses("name", !!errors.name)}
          />
          {errors.name && (
            <span className="animate-in fade-in slide-in-from-top-1 absolute -bottom-5 left-0 text-xs font-medium text-red-500">
              {errors.name.message}
            </span>
          )}
        </div>

        {/* Email Field */}
        <div className="group relative">
          <label htmlFor="email" className={labelClasses("email")}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            onFocus={() => setFocusedField("email")}
            onBlur={async (e) => {
              await register("email").onBlur(e);
              setFocusedField(null);
            }}
            className={inputClasses("email", !!errors.email)}
          />
          {errors.email && (
            <span className="animate-in fade-in slide-in-from-top-1 absolute -bottom-5 left-0 text-xs font-medium text-red-500">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Optional Phone */}
        {(type === "listings" || type === "call" || type === "contact") && (
          <div className="group relative">
            <label htmlFor="phone" className={labelClasses("phone")}>
              Phone Number{" "}
              <span className="tracking-normal text-gray-300 normal-case">
                (Optional)
              </span>
            </label>
            <input
              id="phone"
              type="tel"
              {...register("phone")}
              onFocus={() => setFocusedField("phone")}
              onBlur={async (e) => {
                await register("phone").onBlur(e);
                setFocusedField(null);
              }}
              className={inputClasses("phone", false)}
            />
          </div>
        )}

        {/* Valuation Address */}
        {type === "valuation" && (
          <div className="group relative">
            <label htmlFor="address" className={labelClasses("address")}>
              Property Address
            </label>
            <input
              id="address"
              type="text"
              {...register("address", { required: type === "valuation" })}
              onFocus={() => setFocusedField("address")}
              onBlur={async (e) => {
                await register("address").onBlur(e);
                setFocusedField(null);
              }}
              className={inputClasses("address", !!errors.address)}
            />
            {errors.address && (
              <span className="animate-in fade-in slide-in-from-top-1 absolute -bottom-5 left-0 text-xs font-medium text-red-500">
                {errors.address.message}
              </span>
            )}
          </div>
        )}

        {/* Message */}
        {(type === "contact" || type === "call") && (
          <div className="group relative pt-2">
            <label htmlFor="message" className={labelClasses("message")}>
              How can we help?
            </label>
            <textarea
              id="message"
              rows={3}
              {...register("message")}
              onFocus={() => setFocusedField("message")}
              onBlur={async (e) => {
                await register("message").onBlur(e);
                setFocusedField(null);
              }}
              className={cn(inputClasses("message", false), "resize-none")}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "group relative w-full overflow-hidden bg-black px-6 py-4 text-white transition-all duration-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70",
          "flex items-center justify-center gap-3",
        )}
      >
        <span className="relative z-10 font-medium tracking-wide">
          {isSubmitting ? "Processing..." : getButtonText()}
        </span>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </button>
    </form>
  );
}
