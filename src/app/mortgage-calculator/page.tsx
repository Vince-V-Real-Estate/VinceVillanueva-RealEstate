"use client";

import { DollarSign, Percent } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MortgageCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Mortgage Calculator
          </h1>
          <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
            Estimate your monthly mortgage payments based on home price, down
            payment, interest rate, and loan term.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>
                Adjust the values below to see your estimated payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="home-price">Home Price ($)</Label>
                <div className="relative">
                  <DollarSign className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    id="home-price"
                    type="number"
                    className="pl-9"
                    placeholder="500000"
                    defaultValue={500000}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="down-payment">Down Payment ($)</Label>
                <div className="relative">
                  <DollarSign className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    id="down-payment"
                    type="number"
                    className="pl-9"
                    placeholder="100000"
                    defaultValue={100000}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                <div className="relative">
                  <Percent className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.1"
                    className="pl-9"
                    placeholder="5.5"
                    defaultValue={5.5}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loan-term">Loan Term (Years)</Label>
                <Input
                  id="loan-term"
                  type="number"
                  placeholder="30"
                  defaultValue={30}
                />
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-primary-foreground">
                  Estimated Monthly Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold">$2,271</div>
                <p className="text-primary-foreground/80 mt-2 text-sm">
                  *This is an estimate and does not include taxes, insurance, or
                  HOA fees.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan Amount</span>
                  <span className="font-medium">$400,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Interest (Over 30 years)
                  </span>
                  <span className="font-medium">$417,560</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Cost of Loan
                  </span>
                  <span className="font-medium">$817,560</span>
                </div>
              </CardContent>
            </Card>
            <Button className="w-full" size="lg">
              Get Pre-Approved
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
