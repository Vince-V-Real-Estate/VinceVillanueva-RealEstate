import {PHONE_NUMBER, EMAIL_CONTACT, SUNDAY_HOURS, MONDAY_HOURS, TUESDAY_HOURS, WEDNESDAY_HOURS, THURSDAY_HOURS, FRIDAY_HOURS, SATURDAY_HOURS} from "@/lib/constants/contact";

const officeHours = [
	{day: "Sunday", time: SUNDAY_HOURS},
	{day: "Monday", time: MONDAY_HOURS},
	{day: "Tuesday", time: TUESDAY_HOURS},
	{day: "Wednesday", time: WEDNESDAY_HOURS},
	{day: "Thursday", time: THURSDAY_HOURS},
	{day: "Friday", time: FRIDAY_HOURS},
	{day: "Saturday", time: SATURDAY_HOURS},
];

export default function Contact() {
	return (
		<section
			id="contact"
			className="bg-gray-50 py-20"
		>
			<div className="container mx-auto max-w-6xl px-4">
				<div className="mb-16 text-center">
					<h2 className="mb-4 text-4xl font-bold text-gray-900">Contact Me</h2>
					<p className="mx-auto max-w-2xl text-lg text-gray-600"> Get in touch to discuss your real estate needs. I&apos;m here to help you every step of the way.</p>
				</div>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-2">
					{/* Contact Information */}
					<div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
						<h3 className="mb-8 text-2xl font-semibold text-gray-900">Get In Touch</h3>

						<div className="space-y-6">
							<div className="flex items-start space-x-4">
								<div className="bg-primary/10 rounded-full p-3">
									<svg
										className="text-primary h-6 w-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
										/>
									</svg>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500">Phone</p>
									<a
										href={`tel:${PHONE_NUMBER}`}
										className="hover:text-primary text-lg font-semibold text-gray-900 transition-colors"
									>
										{PHONE_NUMBER}
									</a>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="bg-primary/10 rounded-full p-3">
									<svg
										className="text-primary h-6 w-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-500">Email</p>
									<a
										href={`mailto:${EMAIL_CONTACT}`}
										className="hover:text-primary text-lg font-semibold text-gray-900 transition-colors"
									>
										{EMAIL_CONTACT}
									</a>
								</div>
							</div>
						</div>
					</div>

					{/* Office Hours */}
					<div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
						<h3 className="mb-8 text-2xl font-semibold text-gray-900">Office Hours</h3>
						<div className="space-y-4">
							{officeHours.map((item) => (
								<div
									key={item.day}
									className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
								>
									<span className="font-medium text-gray-600">{item.day}</span>
									<span className="font-semibold text-gray-900">{item.time}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
