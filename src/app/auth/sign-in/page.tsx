"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {signInSchema, type SignInFormData} from "@/lib/zod/sign-in-validation";
import {authClient} from "@/server/better-auth/client";

export default function SignInPage() {
	const router = useRouter();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: {errors, isSubmitting},
	} = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
	});

	const onSubmit = async (data: SignInFormData) => {
		setServerError(null);

		const {error} = await authClient.signIn.email({
			email: data.email,
			password: data.password,
		});

		if (error) {
			setServerError(error.message ?? "Invalid email or password.");
			return;
		}

		router.push("/");
	};

	return (
		<div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
			<Card className="w-full max-w-sm shadow-lg">
				<CardHeader>
					<CardTitle className="text-2xl">Sign In</CardTitle>
					<CardDescription>Enter your email below to login to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="grid gap-4"
					>
						{serverError && <p className="text-sm text-red-500">{serverError}</p>}
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								{...register("email")}
							/>
							{errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
						</div>
						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="password">Password</Label>
							</div>
							<Input
								id="password"
								type="password"
								{...register("password")}
							/>
							{errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Signing in..." : "Sign In"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="flex flex-col gap-2">
					<div className="text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link
							href="/auth/sign-up"
							className="underline"
						>
							Sign up
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
