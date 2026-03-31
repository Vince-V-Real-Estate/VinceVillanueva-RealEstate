import Image from "next/image";

const PARAGRAPHS = [
	{
		paragraph: "Vince prioritizes building relationships over transactions. As a dedicated licensed Realtor®, he is committed to elevating your real estate experience to the highest standards.",
	},
	{
		paragraph:
			"With 9 years in real estate and more than 20 years in the architectural and structural design field, construction, and small business ownership, Vince brings a wealth of experience and a keen eye for detail to every transaction. From new construction and pre-sale purchases to a full range of real estate services, he guides clients through every step with expertise and care.",
	},
	{
		paragraph:
			"For Vince, the most rewarding part of his career is the lasting relationships he builds. He listens carefully to understand each client's unique needs and helps them achieve their real estate goals, whether buying a first home, selling, or finding a dream retirement property.",
	},
	{
		paragraph:
			'Known as the "Higher Standards Realtor," Vince combines a hands-on approach, strong work ethic, and commitment to excellence, resulting in smooth transactions, satisfied clients, and meaningful experiences. A family-oriented homeowner himself, he understands that a home is more than a property. It is where memories are made.',
	},
	{
		paragraph:
			"Serving the Metro Vancouver and Fraser Valley markets, Vince focuses on clear communication, patience, and a client-first approach. He looks forward to guiding new clients through their real estate journey with professionalism, care, and dedication.",
	},
];

export default function Credibility() {
	return (
		<section
			id="about"
			className="w-full scroll-mt-16 bg-white py-12 md:py-24"
		>
			<div className="container mx-auto px-4 md:px-6">
				<div className="flex flex-col items-center justify-between gap-8 md:flex-row">
					<div className="flex w-full flex-col justify-center md:w-1/2">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About Vince</h2>
							{PARAGRAPHS.map((item, index) => (
								<p
									key={index}
									className="my-4 max-w-2xl text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
								>
									{item.paragraph}
								</p>
							))}
						</div>
					</div>
					<div className="relative flex w-full justify-center md:w-1/2">
						<div className="relative h-[500px] w-full max-w-[500px] md:h-[600px] md:max-w-[500px] lg:h-[750px] lg:max-w-[650px]">
							<Image
								src="/vv-asset-1.png"
								alt="Vince Villanueva"
								fill
								className="object-contain"
								sizes="(max-width: 768px) 100vw, 50vw"
								priority
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
