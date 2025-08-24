import Link from "next/link";
import {
  Twitter,
  Linkedin,
  Instagram,
  BookOpen,
  Target,
  TrendingUp,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 pt-0 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-xl font-bold text-purple-400 mr-4">
              Pathly
            </span>
            <span className="text-gray-400 mr-8">
              © {currentYear} Pathly. All rights reserved.
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <span className="text-gray-400 mr-4"> Contact us:</span>
            <a
              href="#"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/amir-pashayev/"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <Instagram className="h-6 w-6" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            Helping students discover their perfect college major and plan their
            academic journey.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {" "}
            {/* Added margin to separate */}
            Founded and developed by{" "}
            <Link
              href="https://www.linkedin.com/in/amir-pashayev/"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              {" "}
              Amir Pashayev
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
