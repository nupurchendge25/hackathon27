import React from "react";

export default function About() {
  return (
    <section id="about" className="bg-white py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* ---------- Heading ---------- */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About Compliance Suite
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Compliance Suite is a modern compliance automation platform designed for
            FinTechs and regulated businesses. We help organizations streamline
            KYC verification, detect AML risks, and stay audit-ready using
            secure, scalable, and intelligent workflows.
          </p>
        </div>

        {/* ---------- Problem & Solution ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto mb-20">
          <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              The Problem
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Manual compliance processes are slow, error-prone, and expensive.
              Teams spend hours verifying documents, checking transactions, and
              generating reports for regulators. This leads to delayed onboarding,
              higher operational costs, and increased regulatory risk.
            </p>
          </div>

          <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Our Solution
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Compliance Suite automates identity verification and AML monitoring
              using OCR, face verification, and rule-based risk engines. Our platform
              reduces manual work, improves accuracy, and gives compliance teams
              full visibility through centralized dashboards.
            </p>
          </div>
        </div>

        {/* ---------- Core Capabilities ---------- */}
        <div className="max-w-6xl mx-auto mb-20">
          <h3 className="text-2xl font-semibold text-center mb-10 text-gray-900">
            What We Do
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-xl">
              <h4 className="font-semibold mb-2">KYC Automation</h4>
              <p className="text-sm text-gray-600">
                Secure upload and verification of PAN, Aadhaar, Passport, and
                Driver’s License with OCR-based data extraction.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl">
              <h4 className="font-semibold mb-2">Face Verification</h4>
              <p className="text-sm text-gray-600">
                Match user selfies with identity documents to prevent identity fraud
                and impersonation.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl">
              <h4 className="font-semibold mb-2">AML Risk Detection</h4>
              <p className="text-sm text-gray-600">
                Identify suspicious patterns using configurable AML rules and
                transaction analysis.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl">
              <h4 className="font-semibold mb-2">Admin Review Workflow</h4>
              <p className="text-sm text-gray-600">
                Dedicated admin dashboard to approve, reject, or flag cases with
                full audit history.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl">
              <h4 className="font-semibold mb-2">Audit-Ready Logs</h4>
              <p className="text-sm text-gray-600">
                Every action is logged for transparency, regulatory audits, and
                compliance reporting.
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl">
              <h4 className="font-semibold mb-2">API & Integration</h4>
              <p className="text-sm text-gray-600">
                Simple APIs and modular architecture allow easy integration into
                existing onboarding systems.
              </p>
            </div>
          </div>
        </div>

        {/* ---------- Security & Trust ---------- */}
        <div className="max-w-6xl mx-auto mb-20 bg-gray-50 border border-gray-200 rounded-xl p-10">
          <h3 className="text-2xl font-semibold mb-6 text-center text-gray-900">
            Security & Compliance First
          </h3>
          <p className="text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
            We follow security-first principles to protect sensitive user data.
            All information is encrypted in transit and at rest, access is
            role-based, and every decision is traceable for regulatory review.
            Our design aligns with industry standards and best practices.
          </p>
        </div>

        {/* ---------- Team ---------- */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold text-center mb-8 text-gray-900">
            Our Team
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-700">A</span>
              </div>
              <p className="font-semibold">Atharv Patil</p>
              <p className="text-sm text-gray-500">Founder & Developer</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-700">M</span>
              </div>
              <p className="font-semibold">Meera Singh</p>
              <p className="text-sm text-gray-500">Engineering Lead</p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-700">R</span>
              </div>
              <p className="font-semibold">Ravi Kumar</p>
              <p className="text-sm text-gray-500">Compliance & Operations</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
