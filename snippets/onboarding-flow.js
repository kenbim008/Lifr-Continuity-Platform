
        // --- Data-minimalist onboarding & estate roadmap ---
        const REGION_LIST = {
            CA: ['Alberta', 'British Columbia', 'Ontario', 'Quebec', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Other province/territory'],
            US: ['California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'Other state'],
            GB: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
            AU: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'Other state/territory']
        };

        const JURISDICTION_CHECKLISTS = {
            'CA-AB': ['Wills and Succession Act (Alberta)', 'Personal directive / enduring power of attorney', 'Adult guardianship & trusteeship', 'Probate filing in Alberta courts'],
            'CA-ON': ['Succession Law Reform Act (Ontario)', 'Power of attorney for property & personal care', 'Estate administration tax', 'Probate application (Certificate of Appointment)'],
            'CA-BC': ['Wills, Estates and Succession Act (BC)', 'Representation agreement', 'Probate in BC Supreme Court'],
            'US-CA': ['California Probate Code', 'Advance health care directive', 'Trust transfer deed (if applicable)'],
            'US-TX': ['Texas Estates Code', 'Medical power of attorney', 'Independent administration options'],
            'US-NY': ['NY Estates, Powers & Trusts Law', 'Health care proxy', 'Surrogate\'s Court filing'],
            'DEFAULT': ['Locate your original Will and POA documents', 'List major financial institutions (names only)', 'Document where proof-of-ownership records live', 'Designate a Navigator with clear access rules']
        };

        const ASSET_CATEGORY_TILES = [
            { id: 'Financial Accounts', icon: 'landmark', desc: 'Banks, brokerages, pensions — names & clues only' },
            { id: 'Physical Valuables', icon: 'home', desc: 'Property, vehicles, collectibles — where to find proof' },
            { id: 'Digital Legacy', icon: 'smartphone', desc: 'Email, social, crypto — routes, not passwords' },
            { id: 'Legal Documents', icon: 'file-text', desc: 'Will, POA, trusts — where originals are held' }
        ];

        const FINANCIAL_INSTITUTIONS = [
            'TD Waterhouse', 'TD Canada Trust', 'RBC', 'BMO', 'Scotiabank', 'CIBC', 'Wealthsimple', 'Questrade',
            'Computershare', 'Fidelity', 'Charles Schwab', 'Vanguard', 'Chase', 'Bank of America', 'Wells Fargo',
            'Other (type below)'
        ];

        const OWNERSHIP_OPTIONS = ['Personal name', 'Joint with spouse', 'Joint with partner', 'Holding company / corporation', 'Trust', 'Other entity'];

        const LOCATION_TAGS = [
            { id: 'physical_safe', label: 'Physical filing cabinet / safe at home' },
            { id: 'email_inbox', label: 'Personal email inbox (search term)' },
            { id: 'laptop_folder', label: 'Digital folder on my laptop' },
            { id: 'cloud_drive', label: 'Cloud drive (iCloud, Google Drive, etc.)' },
            { id: 'law_firm', label: 'Law firm / advisor office' },
            { id: 'other', label: 'Other (describe below)' }
        ];

        const looksLikeSensitiveData = (text) => {
            const s = (text || '').replace(/\s/g, '');
            if (!s) return null;
            if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) return 'That looks like a Social Security Number. Please remove it.';
            if (/\b\d{9}\b/.test(s) && s.length <= 11) return 'That looks like a government ID number. Please remove it.';
            if (/\b(?:\d[ -]*?){13,19}\b/.test(text.replace(/\s/g, ' '))) return 'That looks like a credit or card number. List the institution name only.';
            if (/\b\d{10,17}\b/.test(s)) return 'That looks like a bank account number. Do not enter account numbers — use a location clue instead.';
            if (/(?:password|pin|ssn|sin|cvv|secret\s*key|private\s*key|seed\s*phrase)/i.test(text)) return 'Do not store passwords or secrets here. Map where your executor can find them offline.';
            return null;
        };

        const DataGuardBanner = () => (
            <div className="flex items-start gap-3 bg-blue-900 text-white rounded-lg p-4 mb-4">
                <span className="text-xl flex-shrink-0" aria-hidden="true">🔒</span>
                <div>
                    <p className="font-bold text-sm">DATA GUARD ACTIVE</p>
                    <p className="text-xs text-blue-100 mt-1">Do not enter account numbers, passwords, PINs, or SSNs. We only store clues so your family knows where to look.</p>
                </div>
            </div>
        );

        const SensitiveField = ({ label, value, onChange, placeholder, hint, multiline = false, rows = 2 }) => {
            const warning = looksLikeSensitiveData(value);
            const Input = multiline ? 'textarea' : 'input';
            return (
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                    {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
                    <Input
                        type={multiline ? undefined : 'text'}
                        rows={multiline ? rows : undefined}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${warning ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {warning && (
                        <p className="text-sm text-red-700 mt-2 flex items-start gap-2">
                            <i data-lucide="alert-triangle" className="w-4 h-4 flex-shrink-0 mt-0.5"></i>
                            Oops! {warning}
                        </p>
                    )}
                </div>
            );
        };

        const getJurisdictionKey = (country, region) => {
            if (!country || !region) return 'DEFAULT';
            const abbr = { Alberta: 'AB', 'British Columbia': 'BC', Ontario: 'ON', Quebec: 'QC', California: 'CA', Texas: 'TX', 'New York': 'NY', Florida: 'FL' };
            const code = abbr[region] || region.slice(0, 2).toUpperCase();
            const key = country + '-' + code;
            return JURISDICTION_CHECKLISTS[key] ? key : 'DEFAULT';
        };

        const syncRoadmapToVault = () => {
            const ob = productionData.onboarding;
            if (!ob) return;
            ob.roadmapEntries.forEach((entry, idx) => {
                const exists = productionData.assets.some(a => a.roadmapId === entry.id);
                if (exists) return;
                productionData.assets.push({
                    id: Date.now() + idx,
                    roadmapId: entry.id,
                    category: entry.category,
                    title: entry.institution || entry.category,
                    value: 0,
                    location: entry.locationClue || entry.locationTags?.join(', ') || 'See estate roadmap',
                    beneficiary: entry.ownership || '—',
                    type: 'Roadmap Only'
                });
            });
            if (ob.navigator && ob.navigator.name) {
                const nav = ob.navigator;
                if (!productionData.trustedPeople.some(p => p.email === nav.email && nav.email)) {
                    productionData.trustedPeople.push({
                        id: Date.now(),
                        name: nav.name,
                        email: nav.email || '',
                        phone: '',
                        role: 'Navigator',
                        accessLevel: nav.permissionTier === 'immediate' ? 'Full Access' : 'Conditional — 7-day switch',
                        verified: false
                    });
                }
            }
            if (ob.digitalKeys && ob.digitalKeys.method) {
                const tier = ob.navigator && ob.navigator.permissionTier;
                productionData.digitalAssets.push({
                    id: Date.now() + 1,
                    platform: 'Password access route',
                    category: 'Digital Keys',
                    instructions: ob.digitalKeys.method === 'manager'
                        ? ('Password manager — emergency kit: ' + (ob.digitalKeys.emergencyKitLocation || 'Not specified'))
                        : ('Written passwords — stored at: ' + (ob.digitalKeys.physicalStorageLocation || 'Not specified')),
                    contact: 'See onboarding roadmap',
                    trigger: tier === 'immediate' ? 'Per Navigator access rules' : '7-day conditional unlock'
                });
            }
        };

        const OnboardingFlow = ({ onNavigate, onComplete }) => {
            const ob = productionData.onboarding;
            const [stage, setStage] = useState(ob.stage || 1);
            const [assetStep, setAssetStep] = useState(1);
            const [draft, setDraft] = useState({
                category: '',
                institution: '',
                customInstitution: '',
                ownership: '',
                locationClue: '',
                locationTags: [],
                emailSearchTerm: ''
            });
            const [sensitiveBlock, setSensitiveBlock] = useState(false);

            useEffect(() => { try { lucide.createIcons(); } catch (e) {} }, [stage, assetStep]);

            const jurisdictionKey = getJurisdictionKey(ob.jurisdiction.country, ob.jurisdiction.region);
            const checklist = JURISDICTION_CHECKLISTS[jurisdictionKey] || JURISDICTION_CHECKLISTS.DEFAULT;
            const regions = REGION_LIST[ob.jurisdiction.country] || [];

            const canProceedAsset = () => {
                if (!draft.category) return false;
                if (assetStep === 2 && !draft.institution && !draft.customInstitution) return false;
                if (assetStep === 3 && !draft.ownership) return false;
                if (assetStep === 4) {
                    const clue = draft.locationClue || draft.locationTags.length;
                    if (!clue) return false;
                    const w = looksLikeSensitiveData(draft.locationClue) || looksLikeSensitiveData(draft.customInstitution) || looksLikeSensitiveData(draft.institution);
                    if (w) { setSensitiveBlock(true); return false; }
                }
                return true;
            };

            const saveAssetEntry = () => {
                const inst = draft.institution === 'Other (type below)' ? draft.customInstitution : draft.institution;
                let clue = draft.locationClue;
                if (draft.locationTags.includes('email_inbox') && draft.emailSearchTerm) {
                    clue = (clue ? clue + ' | ' : '') + "Email search: '" + draft.emailSearchTerm + "'";
                }
                ob.roadmapEntries.push({
                    id: Date.now(),
                    category: draft.category,
                    institution: inst,
                    ownership: draft.ownership,
                    locationClue: clue,
                    locationTags: [...draft.locationTags]
                });
                setDraft({ category: '', institution: '', customInstitution: '', ownership: '', locationClue: '', locationTags: [], emailSearchTerm: '' });
                setAssetStep(1);
                setSensitiveBlock(false);
            };

            const finishOnboarding = () => {
                ob.completed = true;
                ob.stage = 5;
                syncRoadmapToVault();
                if (onComplete) onComplete();
                else onNavigate('estate-discovery');
            };

            const progressPct = Math.round(((stage - 1) / 4) * 100);

            return (
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Secure onboarding</span>
                            <span>Stage {stage} of 5</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-900 transition-all duration-300" style={{ width: progressPct + '%' }}></div>
                        </div>
                    </div>

                    {stage === 1 && (
                        <div className="bg-white rounded-xl card-shadow-lg p-8 border-2 border-blue-100">
                            <div className="text-center mb-6">
                                <i data-lucide="shield-check" className="w-14 h-14 text-blue-900 mx-auto mb-4"></i>
                                <h1 className="text-2xl font-bold text-gray-900">Privacy Guarantee</h1>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-6">
                                <p className="text-gray-800 leading-relaxed">
                                    We do <strong>not</strong> want your passwords, bank account numbers, or SSNs.
                                </p>
                                <p className="text-gray-600 mt-3 text-sm">
                                    Our job is to create a secure <strong>roadmap</strong> for your family — not a honey pot for hackers.
                                </p>
                            </div>
                            <ul className="text-sm text-gray-600 space-y-2 mb-8 list-disc list-inside">
                                <li>Never type account numbers — only institution names and location clues</li>
                                <li>Map where documents live, not what's inside them</li>
                                <li>Your Navigator sees directions, not login screens</li>
                            </ul>
                            <button type="button" onClick={() => { ob.stage = 2; setStage(2); }} className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition">
                                Let's Begin
                            </button>
                        </div>
                    )}

                    {stage === 2 && (
                        <div className="bg-white rounded-xl card-shadow-lg p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">The Jurisdictional Anchor</h2>
                            <p className="text-gray-600 text-sm mb-6">Where do you currently reside? We tailor your checklist to local estate law — without collecting sensitive IDs.</p>
                            <DataGuardBanner />
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                <select
                                    value={ob.jurisdiction.country}
                                    onChange={(e) => { ob.jurisdiction.country = e.target.value; ob.jurisdiction.region = ''; }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Select country</option>
                                    {COUNTRY_LIST.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                            </div>
                            {ob.jurisdiction.country && (
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Province or State</label>
                                    {regions.length > 0 ? (
                                        <select
                                            value={ob.jurisdiction.region}
                                            onChange={(e) => { ob.jurisdiction.region = e.target.value; }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="">Select region</option>
                                            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    ) : (
                                        <SensitiveField
                                            label="Region"
                                            value={ob.jurisdiction.region}
                                            onChange={(v) => { ob.jurisdiction.region = v; }}
                                            placeholder="e.g. Alberta, California"
                                            hint="Name only — not a postal code or full address unless you choose to add one later in Estate Planner."
                                        />
                                    )}
                                </div>
                            )}
                            {ob.jurisdiction.country && ob.jurisdiction.region && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm font-semibold text-amber-900 mb-2">Localized checklist prepared</p>
                                    <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                                        {checklist.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setStage(1)} className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50">Back</button>
                                <button type="button" disabled={!ob.jurisdiction.country || !ob.jurisdiction.region} onClick={() => { ob.stage = 3; setStage(3); }} className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-300">Continue</button>
                            </div>
                        </div>
                    )}

                    {stage === 3 && (
                        <div className="bg-white rounded-xl card-shadow-lg p-8">
                            <p className="text-xs text-blue-900 font-semibold mb-1">Interactive asset mapping — Step {assetStep} of 4</p>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">The &quot;Where&quot; Flow</h2>

                            {assetStep === 1 && (
                                <>
                                    <p className="text-sm text-gray-600 mb-4">Choose a category. We only record where things are — not account numbers or balances.</p>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {ASSET_CATEGORY_TILES.map((tile) => (
                                            <button
                                                key={tile.id}
                                                type="button"
                                                onClick={() => { setDraft({ ...draft, category: tile.id }); setAssetStep(2); }}
                                                className={`p-4 rounded-xl border-2 text-left transition ${draft.category === tile.id ? 'border-blue-900 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                            >
                                                <i data-lucide={tile.icon} className="w-6 h-6 text-blue-900 mb-2"></i>
                                                <p className="font-semibold text-sm text-gray-900">{tile.id}</p>
                                                <p className="text-xs text-gray-500 mt-1">{tile.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                    {ob.roadmapEntries.length > 0 && (
                                        <p className="text-sm text-green-700 mb-4">{ob.roadmapEntries.length} roadmap item(s) saved.</p>
                                    )}
                                </>
                            )}

                            {assetStep === 2 && (
                                <>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {draft.category === 'Financial Accounts' ? 'Where do you hold investments or stocks?' :
                                         draft.category === 'Legal Documents' ? 'Where is the original Will or POA held?' :
                                         draft.category === 'Digital Legacy' ? 'Which platform or service?' :
                                         'What valuable item should your executor know about?'}
                                    </p>
                                    {(draft.category === 'Financial Accounts' || draft.category === 'Legal Documents') ? (
                                        <>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Institution or location type</label>
                                            <select value={draft.institution} onChange={(e) => setDraft({ ...draft, institution: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3">
                                                <option value="">Select or type below</option>
                                                {(draft.category === 'Financial Accounts' ? FINANCIAL_INSTITUTIONS : ['Home safe', 'Law firm', 'Bank safety deposit', 'Family member', 'Other (type below)']).map((x) => (
                                                    <option key={x} value={x}>{x}</option>
                                                ))}
                                            </select>
                                            {draft.institution === 'Other (type below)' && (
                                                <SensitiveField label="Custom institution (name only)" value={draft.customInstitution} onChange={(v) => setDraft({ ...draft, customInstitution: v })} placeholder="e.g. Local credit union branch name" hint="Bank name only — never account numbers." />
                                            )}
                                        </>
                                    ) : (
                                        <SensitiveField label="Name or description (no account numbers)" value={draft.customInstitution} onChange={(v) => setDraft({ ...draft, customInstitution: v, institution: v })} placeholder="e.g. Gmail, family cottage, coin collection" hint="Platform or item name only." />
                                    )}
                                    <div className="flex gap-3 mt-4">
                                        <button type="button" onClick={() => setAssetStep(1)} className="flex-1 border py-2 rounded-lg">Back</button>
                                        <button type="button" disabled={!canProceedAsset()} onClick={() => setAssetStep(3)} className="flex-1 bg-blue-900 text-white py-2 rounded-lg disabled:bg-gray-300">Next</button>
                                    </div>
                                </>
                            )}

                            {assetStep === 3 && (
                                <>
                                    <DataGuardBanner />
                                    <SensitiveField
                                        label="Under what legal name or entity are these held?"
                                        value={draft.ownership}
                                        onChange={(v) => setDraft({ ...draft, ownership: v })}
                                        placeholder="e.g. Personal name, Joint with spouse, Holding company"
                                        hint="Helps your executor know which identity to reference — not an account number."
                                    />
                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Quick select</p>
                                        <div className="flex flex-wrap gap-2">
                                            {OWNERSHIP_OPTIONS.map((o) => (
                                                <button key={o} type="button" onClick={() => setDraft({ ...draft, ownership: o })} className={`text-xs px-3 py-1.5 rounded-full border ${draft.ownership === o ? 'bg-blue-900 text-white border-blue-900' : 'border-gray-300 text-gray-700'}`}>{o}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setAssetStep(2)} className="flex-1 border py-2 rounded-lg">Back</button>
                                        <button type="button" disabled={!canProceedAsset()} onClick={() => setAssetStep(4)} className="flex-1 bg-blue-900 text-white py-2 rounded-lg disabled:bg-gray-300">Next</button>
                                    </div>
                                </>
                            )}

                            {assetStep === 4 && (
                                <>
                                    <p className="text-sm text-gray-600 mb-4">If your executor needs proof this exists, where should they look?</p>
                                    <div className="space-y-2 mb-4">
                                        {LOCATION_TAGS.map((tag) => (
                                            <label key={tag.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={draft.locationTags.includes(tag.id)}
                                                    onChange={(e) => {
                                                        const next = e.target.checked
                                                            ? [...draft.locationTags, tag.id]
                                                            : draft.locationTags.filter((t) => t !== tag.id);
                                                        setDraft({ ...draft, locationTags: next });
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                                {tag.label}
                                            </label>
                                        ))}
                                    </div>
                                    {draft.locationTags.includes('email_inbox') && (
                                        <SensitiveField label="Email search term (not your password)" value={draft.emailSearchTerm} onChange={(v) => setDraft({ ...draft, emailSearchTerm: v })} placeholder="e.g. TD Waterhouse" hint="Words to search in inbox — not login credentials." />
                                    )}
                                    <SensitiveField
                                        label="Location clue"
                                        value={draft.locationClue}
                                        onChange={(v) => setDraft({ ...draft, locationClue: v })}
                                        placeholder="e.g. Black fireproof box, master bedroom closet, 2025 tax folder"
                                        hint="Describe where proof lives — not what's on the document."
                                        multiline={true}
                                    />
                                    {sensitiveBlock && <p className="text-sm text-red-600 mb-2">Fix sensitive-looking text before saving.</p>}
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        <button type="button" onClick={() => setAssetStep(3)} className="border px-4 py-2 rounded-lg">Back</button>
                                        <button type="button" disabled={!canProceedAsset()} onClick={saveAssetEntry} className="bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-gray-300">Save item</button>
                                        <button type="button" onClick={() => { ob.stage = 4; setStage(4); setAssetStep(1); }} className="bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold">Save &amp; next stage</button>
                                    </div>
                                </>
                            )}

                            {assetStep === 1 && (
                                <div className="flex gap-3 mt-6 pt-4 border-t">
                                    <button type="button" onClick={() => setStage(2)} className="flex-1 border py-2 rounded-lg">Back</button>
                                    <button type="button" onClick={() => { ob.stage = 4; setStage(4); }} className="flex-1 text-blue-900 font-semibold py-2">Skip mapping for now</button>
                                </div>
                            )}
                        </div>
                    )}

                    {stage === 4 && (
                        <div className="bg-white rounded-xl card-shadow-lg p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Mapping Your Digital Keys</h2>
                            <p className="text-sm text-gray-600 mb-4">We are not a password vault. Tell us the <strong>route</strong> to your existing security system.</p>
                            <DataGuardBanner />
                            <div className="space-y-3 mb-6">
                                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${ob.digitalKeys.method === 'manager' ? 'border-blue-900 bg-blue-50' : 'border-gray-200'}`}>
                                    <input type="radio" name="dk" checked={ob.digitalKeys.method === 'manager'} onChange={() => { ob.digitalKeys.method = 'manager'; }} className="mt-1" />
                                    <span className="text-sm">I use a password manager (1Password, Apple Keychain, Bitwarden, etc.)</span>
                                </label>
                                <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${ob.digitalKeys.method === 'written' ? 'border-blue-900 bg-blue-50' : 'border-gray-200'}`}>
                                    <input type="radio" name="dk" checked={ob.digitalKeys.method === 'written'} onChange={() => { ob.digitalKeys.method = 'written'; }} className="mt-1" />
                                    <span className="text-sm">I keep them written down physically</span>
                                </label>
                            </div>
                            {ob.digitalKeys.method === 'manager' && (
                                <SensitiveField
                                    label="Where is your Emergency Access Kit or recovery key?"
                                    value={ob.digitalKeys.emergencyKitLocation}
                                    onChange={(v) => { ob.digitalKeys.emergencyKitLocation = v; }}
                                    placeholder="e.g. Printed sheet inside family album, living room shelf"
                                    hint="Location clue only — never the master password or recovery secret."
                                    multiline={true}
                                />
                            )}
                            {ob.digitalKeys.method === 'written' && (
                                <SensitiveField
                                    label="Where is this book or file safely stored?"
                                    value={ob.digitalKeys.physicalStorageLocation}
                                    onChange={(v) => { ob.digitalKeys.physicalStorageLocation = v; }}
                                    placeholder="e.g. Locked desk drawer, home office"
                                    hint="Where to find the book — not the passwords themselves."
                                    multiline={true}
                                />
                            )}
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setStage(3)} className="flex-1 border py-3 rounded-lg">Back</button>
                                <button type="button" disabled={!ob.digitalKeys.method} onClick={() => { ob.stage = 5; setStage(5); }} className="flex-1 bg-blue-900 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300">Save &amp; next</button>
                            </div>
                        </div>
                    )}

                    {stage === 5 && (
                        <div className="bg-white rounded-xl card-shadow-lg p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Assign Your Navigator</h2>
                            <p className="text-sm text-gray-600 mb-4">The trusted person who may need your estate roadmap. Name and email only — no government IDs.</p>
                            <DataGuardBanner />
                            <SensitiveField label="Navigator full name" value={ob.navigator.name} onChange={(v) => { ob.navigator.name = v; }} placeholder="e.g. Sarah Anderson" hint="Legal name helps matching — not required to match ID here." />
                            <SensitiveField label="Navigator email" value={ob.navigator.email} onChange={(v) => { ob.navigator.email = v; }} placeholder="sarah@email.com" hint="Used for access requests and notifications." />
                            <p className="text-sm font-semibold text-gray-900 mt-4 mb-2">Permission tier</p>
                            <div className="space-y-3 mb-6">
                                <label className={`block p-4 border-2 rounded-lg cursor-pointer ${ob.navigator.permissionTier === 'immediate' ? 'border-blue-900 bg-blue-50' : 'border-gray-200'}`}>
                                    <input type="radio" name="tier" className="mr-2" checked={ob.navigator.permissionTier === 'immediate'} onChange={() => { ob.navigator.permissionTier = 'immediate'; }} />
                                    <strong className="text-sm">Immediate access</strong>
                                    <p className="text-xs text-gray-600 mt-1 ml-6">Navigator can view the roadmap now (e.g. aging parents &amp; adult children).</p>
                                </label>
                                <label className={`block p-4 border-2 rounded-lg cursor-pointer ${ob.navigator.permissionTier === 'conditional' ? 'border-blue-900 bg-blue-50' : 'border-gray-200'}`}>
                                    <input type="radio" name="tier" className="mr-2" checked={ob.navigator.permissionTier === 'conditional'} onChange={() => { ob.navigator.permissionTier = 'conditional'; }} />
                                    <strong className="text-sm">Conditional access (The Switch)</strong>
                                    <p className="text-xs text-gray-600 mt-1 ml-6">Nothing visible until they request access — 7-day waiting period; you may deny or require secondary confirmation.</p>
                                </label>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setStage(4)} className="flex-1 border py-3 rounded-lg">Back</button>
                                <button type="button" disabled={!ob.navigator.name.trim()} onClick={finishOnboarding} className="flex-1 bg-green-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300">Complete roadmap</button>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        const EstateDiscoveryDirectory = ({ onNavigate, previewMode = false }) => {
            const ob = productionData.onboarding || {};
            const userName = productionData.user.name || 'Account holder';
            const legalEntries = (ob.roadmapEntries || []).filter((e) => e.category === 'Legal Documents');
            const financialEntries = (ob.roadmapEntries || []).filter((e) => e.category === 'Financial Accounts');
            const digitalEntries = (ob.roadmapEntries || []).filter((e) => e.category === 'Digital Legacy');
            const physicalEntries = (ob.roadmapEntries || []).filter((e) => e.category === 'Physical Valuables');
            const dk = ob.digitalKeys || {};

            useEffect(() => { try { lucide.createIcons(); } catch (e) {} }, []);

            const Section = ({ title, children }) => (
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
                    {children}
                </div>
            );

            const EntryBlock = ({ entry }) => (
                <div className="border-l-4 border-blue-900 pl-4 py-2 mb-3 bg-gray-50 rounded-r-lg">
                    <p className="font-semibold text-gray-900">{entry.institution || entry.category}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Ownership:</span> {entry.ownership || '—'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Location of proof:</span> {entry.locationClue || '—'}</p>
                </div>
            );

            return (
                <div>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Estate Discovery Directory</h1>
                        <p className="text-gray-600">What your Navigator sees when the vault is verified and unlocked — directions, not login screens.</p>
                        {previewMode && (
                            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 inline-block">Preview — sample roadmap layout</p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl card-shadow-lg p-8 border border-gray-200">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                            <i data-lucide="clipboard-list" className="w-8 h-8 text-blue-900"></i>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Estate Roadmap for {userName}</h2>
                                {ob.jurisdiction && ob.jurisdiction.region && (
                                    <p className="text-sm text-gray-500">Jurisdiction: {COUNTRY_LIST.find(c => c.code === ob.jurisdiction.country)?.name || ob.jurisdiction.country} / {ob.jurisdiction.region}</p>
                                )}
                            </div>
                        </div>

                        <Section title="1. Primary legal documents">
                            {legalEntries.length ? legalEntries.map((e) => <EntryBlock key={e.id} entry={e} />) : (
                                <p className="text-sm text-gray-500 italic">No legal document locations mapped yet.</p>
                            )}
                        </Section>

                        <Section title="2. Investment &amp; financial portfolios">
                            {financialEntries.length ? financialEntries.map((e) => <EntryBlock key={e.id} entry={e} />) : (
                                <p className="text-sm text-gray-500 italic">No financial institutions mapped yet.</p>
                            )}
                        </Section>

                        <Section title="3. Physical valuables">
                            {physicalEntries.length ? physicalEntries.map((e) => <EntryBlock key={e.id} entry={e} />) : (
                                <p className="text-sm text-gray-500 italic">None listed.</p>
                            )}
                        </Section>

                        <Section title="4. Digital access routes">
                            {dk.method ? (
                                <div className="border-l-4 border-indigo-600 pl-4 py-2 bg-indigo-50/50 rounded-r-lg">
                                    <p className="font-semibold text-gray-900">
                                        {dk.method === 'manager' ? 'Password manager' : 'Written passwords'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {dk.method === 'manager'
                                            ? ('Emergency / recovery location: ' + (dk.emergencyKitLocation || 'Not specified'))
                                            : ('Stored at: ' + (dk.physicalStorageLocation || 'Not specified'))}
                                    </p>
                                </div>
                            ) : <p className="text-sm text-gray-500 italic">Digital key route not mapped.</p>}
                            {digitalEntries.map((e) => <EntryBlock key={e.id} entry={e} />)}
                        </Section>

                        {ob.navigator && ob.navigator.name && (
                            <Section title="5. Navigator">
                                <p className="text-sm text-gray-700"><strong>{ob.navigator.name}</strong> — {ob.navigator.permissionTier === 'immediate' ? 'Immediate access' : 'Conditional access (7-day switch)'}</p>
                            </Section>
                        )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button type="button" onClick={() => onNavigate('onboarding')} className="px-4 py-2 border border-blue-900 text-blue-900 rounded-lg font-semibold hover:bg-blue-50">Edit roadmap</button>
                        <button type="button" onClick={() => onNavigate('dashboard')} className="px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800">Dashboard</button>
                    </div>
                </div>
            );
        };
