"use client";

import PDFDropzone from "@/components/PDFDropzone";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart, Check, Search, Shield, Upload } from "lucide-react";
import Link from "next/dist/client/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-4 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Intelligent Receipts Scanning
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Scan analyze, and organize your receipts with AI-powered
                precision. Save time and gain insights from your expenses.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/receipts">
                <Button className="bg-purple-600 hover:bg-purple-700 cursor-pointer">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" className="cursor-pointer">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* PDF Dropzone */}
        <div className="mt-12 flex justify-center">
          <div className="relative w-full max-w-3xl rounded-lg border 
         border-gray-200 bg-white shadow-lg overflow-hidden
         dark:border-gray-800 dark:bg-gray-950">
            <div className="p-6 md:p-8 relative">
              <PDFDropzone />
            </div>
          </div>
        </div>
      </section>
      {/* Feature */}

      <section id="features" className="py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Powerful Features
              </h2>
              <p className="max-w-[700px ] text-gray-500 md:text-xl
                     dark:text-gray-400">
                Our AI-powered platform transforms how you handle receipts and
                track expenses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {/* Feature 1 */}
              <div className="flex flex-col items-center space-y-2 border
                     border-gray-200 rounded-lg p-6 dark:border-gray-800">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <h3 className="text-xl font-bold">Easy Uploads</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Drag and drop your PDF receipts for instant scanning and
                  processing.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center space-y-2 border
                border-gray-200 rounded-lg p-6 dark:border-gray-800">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <Search className="h-6 w-6 text-green-600
               dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold">AI Analysis</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Automatically extract and categorize expense data with
                  intelligent AI.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center space-y-2 border
             border-gray-200 rounded-lg p-6 dark:border-gray-800">
                <div className="p-3 rounded-full bg-purple-100
                         dark:bg-purple-900">
                  <BarChart className="h-6 w-6 text-purple-600
                   dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">Expense Insights</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Generate reports and gain valuable insights from your spending
                  patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Simple Pricing
              </h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl
               dark:text-gray-400">
                Choose a plan that fits your needs. No hidden fees, cancel anytime.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Free</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Free tier for all to try!
                </p>
              </div>
              <div className="mt-4">
                <p className="text-4xl font-bold">$0.00</p>
                <p className="text-gray-500 dark:text-gray-400">/month</p>
              </div>
              <ul className="mt-6 space-y-2 flex-1">
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>2 Scans per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>Basic data extraction</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>7-day history</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/manage-plan">
                  <Button className="w-full cursor-pointer" variant="outline">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </div>
            {/* Starter Tier */}
            <div className="flex flex-col p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Starter</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  A taste of expensing goodness!
                </p>
              </div>
              <div className="mt-4">
                <p className="text-4xl font-bold">$4.99</p>
                <p className="text-gray-500 dark:text-gray-400">/month</p>
              </div>
              <ul className="mt-6 space-y-2 flex-1">
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>50 Scans per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>Enhanced data extraction</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>30-day history</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>Basic export options</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/manage-plan">
                  <Button className="w-full cursor-pointer" variant="outline">
                    Choose Plan
                  </Button>
                </Link>
              </div>
            </div>
            {/* Pro Tier */}
            <div className="flex flex-col p-6 bg-blue-50 border border-blue-200 rounded-lg 
     relative dark:border-blue-900 dark:bg-blue-900/20">

              {/* "Popular" Label */}
              <div className="absolute -top-3 right-4 bg-blue-600 text-white px-3 py-1 
         rounded-full text-sm font-medium">
                Popular
              </div>

              {/* Header */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Pro features for the pro user!
                </p>
              </div>

              {/* Pricing */}
              <div className="mt-4">
                <p className="text-4xl font-bold">$9.99</p>
                <p className="text-gray-500 dark:text-gray-400">/month</p>
              </div>

              {/* Features List */}
              <ul className="mt-6 space-y-2 flex-1">
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>300 Scans per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>Advanced AI data extraction</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>AI Summaries</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>Expense categories & tags</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>Advanced export options</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-green-500 h-5 w-5 mr-2" />
                  <span>Unlimited history</span>
                </li>
              </ul>

              {/* Call-to-Action */}
              <div className="mt-6">
                <Link href="/manage-plan">
                  <Button className="w-full cursor-pointer bg-purple-600 hover:bg-purple-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="py-16 md:py-24 bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
                Join Thousands of Businesses
              </h2>
              <p className="text-gray-600 md:text-xl dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Transform your expense management with AI-powered receipt scanning.
                Trusted by accounting firms, startups, and enterprises worldwide.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">Receipts Scanned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">99.9%</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">10K+</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">AI Processing</div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">GDPR Ready</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Bank-Level Security</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12">
              <Link href="/manage-plan">
                <Button className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                No credit card required • 7-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="container px-4 md:px-6 py-8 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">

            {/* Logo and Name */}
            <div className="flex items-center space-x-1">
              <Shield className="h-6 w-6 text-blue-600" /> {/* import from "lucide-react" */}
              <span className="text-xl font-semibold">Expensio</span>
            </div>

            {/* Tagline/Copyright */}
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Expensio. The smarter way to track your money.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
