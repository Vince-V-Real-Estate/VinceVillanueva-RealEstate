import {MapPin} from "lucide-react";

export default function MLSSearchBar() {
	return (
		<div className="group relative w-full">
			{/* Animated Ambient Glow */}
			<div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-neutral-200 via-neutral-100 to-neutral-200 opacity-50 blur-md transition-all duration-700 group-focus-within:-inset-1 group-focus-within:from-neutral-300 group-focus-within:via-gray-200 group-focus-within:to-neutral-300 group-focus-within:opacity-100 group-focus-within:blur-xl group-hover:-inset-1 group-hover:opacity-80 group-hover:blur-lg"></div>

			{/* Input Wrapper */}
			<div className="relative flex h-14 w-full items-center overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 group-focus-within:border-black/5 group-focus-within:bg-neutral-50/50 group-focus-within:shadow-[0_10px_50px_rgb(0,0,0,0.15)] group-hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)]">
				{/* Icon Container */}
				<div className="absolute top-1/2 left-2 flex h-10 w-10 -translate-y-1/2 flex-col items-center justify-center rounded-xl bg-neutral-100/50 transition-all duration-500 group-focus-within:rotate-3 group-focus-within:bg-white group-focus-within:shadow-sm">
					<MapPin className="h-5 w-5 text-neutral-400 transition-all duration-500 group-focus-within:-translate-y-1 group-focus-within:scale-110 group-focus-within:text-black" />
					{/* Little floating dot */}
					<div className="absolute bottom-2 h-1 w-1 rounded-full bg-black opacity-0 transition-all duration-500 group-focus-within:opacity-100" />
				</div>

				{/* Actual Input */}
				<input
					type="text"
					name="location"
					placeholder="City, Neighborhood, Address or MLS® Number"
					className="h-full w-full border-none bg-transparent pr-6 pl-14 text-base text-neutral-800 transition-all duration-500 outline-none placeholder:text-neutral-400 focus:ring-0 sm:text-lg"
					autoComplete="off"
				/>

				{/* Decorative Focus Lines */}
				<div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-black opacity-0 transition-all duration-500 ease-out group-focus-within:w-2/3 group-focus-within:opacity-100"></div>

				{/* Right side scanner fade effect */}
				<div className="pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-linear-to-l from-white via-white/80 to-transparent opacity-100 transition-all duration-500 group-focus-within:w-4 group-focus-within:opacity-0"></div>
			</div>
		</div>
	);
}
