import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, HeartHandshake, School } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-campus-950 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-campus-600 text-white flex items-center justify-center font-bold">
                <School className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CampusFind</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The official centralized, secure campus lost and found platform. Replacing chaotic chat groups with trusted ownership verification.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore Portal
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/items" className="hover:text-white transition-colors">
                  Browse All Items
                </Link>
              </li>
              <li>
                <Link href="/items?type=LOST" className="hover:text-white transition-colors">
                  Lost Listings
                </Link>
              </li>
              <li>
                <Link href="/items?type=FOUND" className="hover:text-white transition-colors">
                  Found Items
                </Link>
              </li>
              <li>
                <Link href="/report/lost" className="hover:text-white transition-colors">
                  Submit Lost Report
                </Link>
              </li>
              <li>
                <Link href="/report/found" className="hover:text-white transition-colors">
                  Submit Found Report
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Verification Guarantee */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Security Guarantee
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Zero Public Phone Numbers: All handovers coordinated in-app.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Lock className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Anti-Fraud Hashed Verification: Distinguishing answers are protected.</span>
              </li>
              <li className="flex items-start space-x-2">
                <HeartHandshake className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Verified Handover Records: State transitions logged with audit trails.</span>
              </li>
            </ul>
          </div>

          {/* Institutional Compliance */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Campus Security
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              For high-value items (laptops, jewelry, passports) or items found in restricted campus zones, you may also hand them directly to Central Campus Security.
            </p>
            <div className="p-2.5 rounded-lg bg-campus-900 border border-campus-800 text-xs text-slate-300">
              <span className="font-semibold block text-white">Emergency Desk:</span>
              Security Office, Ground Floor Admin Block
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} University Campus Lost & Found Platform. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>Security Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
