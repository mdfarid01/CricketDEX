import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-secondary text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xl font-bold mb-4">CricketDEX</div>
            <p className="text-sm text-neutral-300 mb-4">The first decentralized betting exchange for cricket, built on blockchain technology.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-white">
                <i className="ri-twitter-x-line text-lg"></i>
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <i className="ri-telegram-line text-lg"></i>
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <i className="ri-discord-line text-lg"></i>
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <i className="ri-github-line text-lg"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><Link href="/"><span className="hover:text-white">Markets</span></Link></li>
              <li><Link href="/how-it-works"><span className="hover:text-white">How It Works</span></Link></li>
              <li><Link href="/tokenomics"><span className="hover:text-white">Tokenomics</span></Link></li>
              <li><Link href="/governance"><span className="hover:text-white">Governance</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-white">Documentation</a></li>
              <li><a href="#" className="hover:text-white">API</a></li>
              <li><a href="#" className="hover:text-white">Smart Contracts</a></li>
              <li><a href="#" className="hover:text-white">Whitepapers</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Risk Disclosure</a></li>
              <li><a href="#" className="hover:text-white">Responsible Gambling</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-6 text-sm text-neutral-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} CricketDEX. All rights reserved.
            </div>
            <div>
              The platform is not available in restricted jurisdictions. Please comply with your local laws.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
