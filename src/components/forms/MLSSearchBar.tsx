import {Input} from "../ui/input";

export default function MLSSearchBar() {
	return (
		<div className="flex w-full items-center justify-center transition-all duration-500 sm:w-[67%] sm:focus-within:w-full sm:hover:w-[95%] md:p-2">
			<Input
				type="text"
				name="location"
				placeholder="City, Neighborhood, Address or MLS® Number"
				className="mx-auto my-1.75 block h-10 w-full rounded-md border-neutral-800 bg-[linear-gradient(142.99deg,rgba(217,217,217,0.63)_15.53%,rgba(243,243,243,0.63)_88.19%)] px-3.75 py-4.5 text-center text-lg text-[rgb(34,34,34)] shadow-md transition-all duration-500 outline-none focus-visible:ring-0 sm:h-12 lg:text-xl"
			/>
		</div>
	);
}
