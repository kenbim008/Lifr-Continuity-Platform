# -*- coding: utf-8 -*-
"""Clone production app into demo file with sample data only in demo."""
import re
from pathlib import Path

ROOT = Path(__file__).parent
PROD = ROOT / "LCP - Production.html"
DEMO = ROOT / "LCP - Production Demo.html"

DEMO_DATA = r'''        // Demo Data Store (cloned from production — sample data for presentation only)
        const productionData = {
            user: {
                name: "John Anderson",
                email: "john.anderson@email.com",
                mfaEnabled: true,
                lastCheckIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                nextCheckIn: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
                status: "Active"
            },
            subscription: {
                status: "active",
                plan: "Premium",
                creditCardOnFile: true,
                firstMonthFree: false,
                cancelledAt: null,
                gracePeriodEndsAt: null,
                downgradedAt: null,
                previousPlan: null,
                pendingCheckoutPlan: null
            },
            stripeConnectPayoutsEnabled: true,
            onboarding: {
                completed: true,
                stage: 5,
                jurisdiction: { country: 'CA', region: 'Alberta' },
                roadmapEntries: [
                    { id: 1, category: 'Legal Documents', institution: 'Riverside Law Firm', ownership: 'Personal name', locationClue: 'Original Will on file; reference under full legal name', locationTags: ['law_firm'] },
                    { id: 2, category: 'Financial Accounts', institution: 'TD Waterhouse', ownership: 'Personal name', locationClue: 'Black fireproof box, master bedroom closet — 2025 tax folder', locationTags: ['physical_safe'] },
                    { id: 3, category: 'Digital Legacy', institution: '1Password', ownership: 'Personal name', locationClue: 'Recovery key printed inside family album, living room shelf', locationTags: ['physical_safe'] }
                ],
                digitalKeys: { method: 'manager', emergencyKitLocation: 'Printed inside family album on living room shelf', physicalStorageLocation: '' },
                navigator: { name: 'Sarah Anderson', email: 'sarah@email.com', permissionTier: 'conditional' }
            },
            assets: [
                { id: 1, category: "Real Estate", title: "Primary Residence", value: 450000, location: "123 Main St, Calgary, AB", beneficiary: "Sarah Anderson", type: "Inform Only" },
                { id: 2, category: "Bank Accounts", title: "TD Checking Account", value: 25000, location: "TD Bank — see estate roadmap", beneficiary: "Sarah Anderson", type: "Provide Document" },
                { id: 3, category: "Investment Accounts", title: "RRSP Portfolio", value: 180000, location: "Questrade Account", beneficiary: "Children Trust", type: "Provide Contact Details" },
                { id: 4, category: "Business Interests", title: "Tech Startup LLC", value: 75000, location: "Alberta Corporation", beneficiary: "Business Partner", type: "Release Trigger" }
            ],
            legalDocs: [
                { id: 1, type: "Will", name: "Last Will & Testament", uploaded: "2024-01-15", size: "2.3 MB", recipients: ["Executor", "Spouse"] },
                { id: 2, type: "Power of Attorney", name: "POA - Healthcare", uploaded: "2024-01-15", size: "1.1 MB", recipients: ["Spouse"] },
                { id: 3, type: "Living Will", name: "Healthcare Directive", uploaded: "2024-01-15", size: "890 KB", recipients: ["Spouse", "Children"] }
            ],
            trustedPeople: [
                { id: 1, name: "Sarah Anderson", email: "sarah@email.com", phone: "+1-555-0101", role: "Navigator", accessLevel: "Conditional — 7-day switch", verified: true },
                { id: 2, name: "Michael Chen", email: "michael@email.com", phone: "+1-555-0102", role: "Trusted Contact", accessLevel: "Concern Verification", verified: true },
                { id: 3, name: "Jennifer Smith", email: "jennifer@email.com", phone: "+1-555-0103", role: "Legal Advisor", accessLevel: "Legal Documents Only", verified: false },
                { id: 4, name: "David Anderson", email: "david@email.com", phone: "+1-555-0104", role: "Beneficiary", accessLevel: "View Only - Post Trigger", verified: true }
            ],
            digitalAssets: [
                { id: 1, platform: "Gmail", category: "Email", instructions: "Memorialize account", contact: "Google Account Recovery", trigger: "60 days post-verification" },
                { id: 2, platform: "Facebook", category: "Social Media", instructions: "Delete account", contact: "Contact: sarah@email.com", trigger: "30 days post-verification" },
                { id: 3, platform: "Coinbase", category: "Crypto Wallet", instructions: "Recovery phrase stored offline", contact: "Executor instructions", trigger: "Immediate - Executor Only" },
                { id: 4, platform: "AWS", category: "Cloud Storage", instructions: "Transfer to business partner", contact: "partner@company.com", trigger: "7 days post-verification" }
            ],
            estatePlanner: {
                personal: { fullName: "John Robert Anderson", dob: "1970-05-15", address: "123 Main St, Calgary, AB T2P 1A1" },
                executor: { name: "Sarah Anderson", relationship: "Spouse", phone: "+1-555-0101", backup: "Michael Chen" },
                guardians: { primary: "Sarah Anderson", backup: "Jennifer Smith", notes: "For minor children Emily (12) and Lucas (9)" },
                allocation: "Equal distribution to children's education trusts. Primary residence to spouse. Investment accounts split 60/40 spouse/children.",
                specialInstructions: "Maintain family cottage for 5 years minimum. Donate piano to local music school.",
                funeral: "Cremation preferred. Memorial service at Riverside Chapel. Donations to Heart & Stroke Foundation."
            }
        };
'''

text = PROD.read_text(encoding="utf-8")

# Replace productionData block
text_demo = re.sub(
    r"        // Production Data Store \(no demo data\)\s*const productionData = \{.*?\n        \};\n",
    DEMO_DATA + "\n",
    text,
    count=1,
    flags=re.DOTALL,
)

# Title
text_demo = text_demo.replace(
    "<title>LegacyVault - Production</title>",
    "<title>LegacyVault - Demo (Sample Data)</title>",
    1,
)

# Demo mode flag
text_demo = text_demo.replace("const IS_DEMO_APP = false;", "const IS_DEMO_APP = true;", 1)

# Footer links
text_demo = text_demo.replace(
    '<a href="/demo" className="block text-[#015DE7] hover:text-blue-300 transition">Demo (with sample data)</a>',
    '<a href="/" className="block text-[#015DE7] hover:text-blue-300 transition">Production site (no sample data)</a>',
    1,
)

# Signup helper link
text_demo = text_demo.replace(
    '''<a href="/demo" className="text-blue-900 font-semibold hover:underline">
                                    Open the demo app
                                </a>
                                <span className="text-gray-500"> — same experience with sample data only</span>''',
    '''<a href="/" className="text-blue-900 font-semibold hover:underline">
                                    Return to production site
                                </a>
                                <span className="text-gray-500"> — live app with no pre-filled data</span>''',
    1,
)

# Start logged in on dashboard with sample user
text_demo = text_demo.replace(
    "const [currentPage, setCurrentPage] = useState('home');\n            const [isAuthenticated, setIsAuthenticated] = useState(false);\n            const [userDisplayName, setUserDisplayName] = useState('');",
    "const [currentPage, setCurrentPage] = useState('dashboard');\n            const [isAuthenticated, setIsAuthenticated] = useState(true);\n            const [userDisplayName, setUserDisplayName] = useState(productionData.user.name || '');",
    1,
)

# Affiliate dashboard demo stats
text_demo = text_demo.replace(
    "isDemo: false, showRules: false",
    "isDemo: true, showRules: false",
    1,
)

# HomePage demo banner
if "<DemoModeBanner />" not in text_demo.split("const HomePage")[1][:1200]:
    text_demo = text_demo.replace(
        "            return (\n                <div className=\"min-h-screen\">\n                    {/* Navigation */}",
        "            return (\n                <div className=\"min-h-screen\">\n                    <DemoModeBanner />\n                    {/* Navigation */}",
        1,
    )

# Login/signup banners
text_demo = text_demo.replace(
    "            return (\n                <div className=\"min-h-screen bg-gray-50 flex flex-col\">\n                    {country != null && (",
    "            return (\n                <div className=\"min-h-screen bg-gray-50 flex flex-col\">\n                    <DemoModeBanner />\n                    {country != null && (",
    2,
)

DEMO.write_text(text_demo, encoding="utf-8")
print(f"Wrote {DEMO.name} ({len(text_demo)} bytes) from production clone with demo sample data.")
