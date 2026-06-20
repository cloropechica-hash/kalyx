
const STORAGE_KEY = 'cybersafe_trainer';

// ====== DATA ======
const lessons = {
  phishing: {
    title: 'Phishing Awareness',
    steps: [
      { title: 'Ano ang Phishing?', text: 'Ang phishing ay isang uri ng cyber attack kung saan nagpapanggap ang attacker bilang lehitimong entity para manlinlang ng biktima na magbigay ng sensitive info tulad ng passwords, credit card numbers, o personal data. Karaniwang dumarating ito sa pamamagitan ng email, SMS (smishing), o phone call (vishing).' },
      { title: 'Red Flags ng Phishing Email', text: 'Mga palatandaan ng phishing email:\n\n1. Generic greeting ("Dear User" hindi "Dear Juan")\n2. Urgent tone ("I-verify ang account mo NOW o madi-disable!")\n3. Suspicious sender address (micros0ft@xyz.com hindi @microsoft.com)\n4. Grammar at spelling errors\n5. May attachment o link na unexpected\n6. Threat o consequence kung hindi ka kumilos\n7. Request for sensitive information (never hihingin ng lehitimong kumpanya ang password mo via email)' },
      { title: 'URL Inspection', text: 'Bago mag-click ng link, i-hover ang mouse para makita ang totoong URL. Kung ang link ay nagsasabing "https://www.microsoft.com/security" pero ang actual URL ay "http://bit.ly/2xYzAbc" ΓÇö huwag i-click. Tandaan: HTTPS Γëá safe. Maraming phishing sites ang gumagamit ng HTTPS.' },
      { title: 'Attachment Safety', text: 'Huwag magbukas ng attachment na hindi mo inaasahan, kahit galing sa kakilala. Ang mga common na mapanganib na file types ay: .exe, .zip, .js, .vbs, .scr, .bat. Kung may attachment na .docm o .xlsm (may macros), i-verify muna sa sender kung sila nga ang nagpadala.' },
      { title: 'Reporting Phishing', text: 'Kapag nakatanggap ka ng kahina-hinalang email:\n1. Huwag i-click ang kahit anong link o attachment\n2. Huwag reply-an\n3. I-report agad sa IT department\n4. Sa Outlook: pindutin ang "Report Phishing" button\n5. Sa Gmail: i-click ang "Report spam" at "Report phishing"\n6. I-delete ang email pagkatapos mag-report' }
    ]
  },
  passwords: {
    title: 'Password Security',
    steps: [
      { title: 'Bakit Importante ang Password?', text: 'Ang password ang first line of defense mo laban sa unauthorized access. 81% ng data breaches ay dahil sa weak o stolen passwords. Ang isang strong password ay ang pinakamura at pinakamadaling paraan para protektahan ang iyong account.' },
      { title: 'Strong Password Rules', text: 'Gumawa ng password na:\n- Hindi bababa sa 12 characters\n- May kumbinasyon ng uppercase, lowercase, number, at special character\n- Hindi gamit ang personal info (birthday, pet name, phone number)\n- Hindi gamit ang common words (password123, admin2024)\n- Unique sa bawat account (huwag i-reuse ang password)\n\nHalimbawa ng strong password: "C0ff33!Mug#2024$P1ease" (madaling tandaan, mahirap hulaan)' },
      { title: 'Password Managers', text: 'Imposibleng matandaan ang lahat ng unique, strong passwords para sa bawat account. Ang password manager (tulad ng Bitwarden, 1Password, LastPass, o Google Password Manager) ay nagse-save at nag-a-auto-fill ng passwords mo. Iisa lang ang kailangan mong tandaan: ang master password.' },
      { title: 'Multi-Factor Authentication (MFA)', text: 'Ang MFA ay nagdadagdag ng second layer ng security. Kahit ma-compromise ang password mo, kailangan pa rin ng second factor:\n\nSomething you KNOW (password)\nSomething you HAVE (phone, hardware key)\nSomething you ARE (fingerprint, face)\n\nBest practice: Gamitin ang authenticator app (Google Authenticator, Microsoft Authenticator) ΓÇö hindi SMS (vulnerable sa SIM swapping).' },
      { title: 'Password Expiration Best Practice', text: 'Ayon sa NIST guidelines, HINDI na kailangan ng mandatory password expiration every 90 days UNLESS may evidence of compromise. Mas importante ang:\n- Paggamit ng MFA\n- Pag-monitor ng compromised credentials\n- Pag-change lang ng password kung may suspected breach\n- Pag-require ng password change pagkatapos ng security incident' }
    ]
  },
  social: {
    title: 'Social Engineering',
    steps: [
      { title: 'Ano ang Social Engineering?', text: 'Ang social engineering ay ang psychological manipulation ng tao para magbigay ng confidential information o access. Hindi nito ine-exploit ang technology kundi ang human nature ΓÇö trust, fear, urgency, helpfulness. Ito ang pinaka-effective na attack vector dahil mas madaling i-hack ang tao kaysa sa computer.' },
      { title: 'Common Social Engineering Tactics', text: '1. Pretexting: Gumagawa ng false scenario ("IT support ito, kailangan namin ang password mo for maintenance")\n2. Baiting: Nag-iiwan ng infected USB drive sa parking lot na may label na "Confidential Salary Info"\n3. Tailgating: Sumusunod sa empleyado papasok ng restricted area na nagpapanggap na "nakalimot ang badge"\n4. Quid pro quo: Nag-aalok ng reward kapalit ng info ("Free coffee voucher, i-verify lang ang email mo")\n5. Impersonation: Nagpapanggap na VIP, vendor, o government official' },
      { title: 'Phishing Variants', text: 'Bukod sa regular na email phishing:\n- Spear phishing: Naka-target sa specific na tao/department gamit ang personal details\n- Whaling: Naka-target sa executives (CEO, CFO)\n- Smishing: Phishing via SMS/text message\n- Vishing: Phishing via phone call (Voice phishing)\n- Clone phishing: Ginagaya ang legitimate email pero pinalitan ang link/attachment\n- Business Email Compromise (BEC): Nagpapanggap na CEO para mag-request ng wire transfer' },
      { title: 'Paano Mag-verify ng Identity', text: 'Bago magbigay ng sensitive information:\n1. Magtanong ng details na alam lang ng lehitimong tao\n2. Tawagan ang official number (hindi ang number na binigay nila)\n3. Mag-email sa official email address (huwag reply-an ang kahina-hinalang email)\n4. Kumpirmahin sa manager o HR kung legitimate ang request\n5. Tandaan: Ang IT department ay HINDI hihingi ng password mo' },
      { title: 'Physical Security Awareness', text: 'Hindi lang digital ang social engineering:\n- I-lock ang workstation kapag aalis (Windows+L)\n- Huwag mag-iwan ng sensitive documents sa desk (clean desk policy)\n- I-secure ang company ID ΓÇö huwag ipakita sa labas ng office\n- I-verify ang identity ng unknown people sa office (walang badge? escort sa reception)\n- I-report agad ang kahina-hinalang tao sa security o IT' }
    ]
  },
  dataprotection: {
    title: 'Data Protection',
    steps: [
      { title: 'Data Classification', text: 'Mahalagang malaman ang sensitivity ng data na hinahawakan mo:\n\nPublic ΓÇö pwedeng i-share sa kahit sino (press releases, job postings)\nInternal ΓÇö for employees only (policies, procedures)\nConfidential ΓÇö sensitive business data (financial reports, client lists)\nRestricted ΓÇö highly sensitive, limited access (trade secrets, PII, legal documents)\n\nBilang empleyado, responsibilidad mong protektahan ang confidential at restricted data.' },
      { title: 'Secure File Sharing', text: 'Huwag mag-email ng sensitive files bilang attachment. Gamitin ang:\n- OneDrive/SharePoint: "Specific people" link na may expiration\n- Google Drive: I-set ang permissions sa "Restricted" at "View only"\n- Internal file server: Para sa documents na kailangan ng maraming tao\n\nHuwag gumamit ng personal cloud storage (personal Google Drive, Dropbox) para sa company files.' },
      { title: 'Encryption', text: 'Ang encryption ay ang process ng pag-convert ng data sa code para hindi ito mabasa ng unauthorized na tao.\n\n- Data at rest: BitLocker (Windows), FileVault (Mac) ΓÇö i-encrypt ang buong hard drive\n- Data in transit: VPN, HTTPS ΓÇö protektado ang data habang pumupunta sa internet\n- Email encryption: Para sa confidential emails ΓÇö gamitin ang "Encrypt" button sa Outlook\n\nKung nawala ang laptop mo pero naka-encrypt ito, safe ang data mo.' },
      { title: 'Clean Desk Policy', text: 'Ang clean desk policy ay hindi lang para sa itsura ΓÇö ito ay security measure:\n\n- I-lock ang documents sa drawer bago umuwi\n- Huwag mag-iwan ng passwords na naka-post-it note sa monitor\n- I-logout sa computer kapag aalis (kahit saglit lang)\n- I-shred ang documents na may sensitive info bago itapon\n- Huwag mag-print ng confidential documents at iwan sa printer\n- I-clear ang whiteboard pagkatapos ng meeting na may sensitive discussion' },
      { title: 'GDPR at Data Privacy', text: 'Ang data privacy laws (GDPR sa Europe, Data Privacy Act sa Pilipinas) ay nagpoprotekta sa personal information ng mga tao. Bilang empleyado:\n\n- Kolektahin lang ang data na kailangan para sa trabaho\n- Huwag mag-share ng personal info ng ibang tao nang walang consent\n- I-report agad ang data breach sa IT at DPO (Data Protection Officer)\n- Alamin ang privacy policy ng kompanya\n- Kapag may nag-request na i-delete ang personal data nila, i-escort sa HR/DPO' }
    ]
  },
  devicesecurity: {
    title: 'Device Security',
    steps: [
      { title: 'Locking Your Device', text: 'I-lock ang computer kapag aalis kahit saglit lang.\n- Windows: Windows + L key\n- Mac: Control + Command + Q\n- Mag-set ng screen saver na may password (max 5 minutes timeout)\n\nAng isang unlocked computer ay open door para sa kahit sinong magkaroon ng access sa company data. Sa loob lang ng 30 seconds, pwedeng mag-send ng fraudulent email gamit ang account mo.' },
      { title: 'Lost/Stolen Device Protocol', text: 'Kapag nawala o nanakaw ang company device:\n1. I-report agad sa IT department (within 1 hour)\n2. Huwag subukang i-locate ang device nang mag-isa\n3. Huwag i-remote wipe kung hindi in-utusan ng IT (maaaring mag-delete ng ebidensya)\n4. Mag-change ng passwords sa lahat ng accounts\n5. Kung may company data sa personal phone, i-report din para ma-remote wipe ang company data lang\n\nAng mabilis na reporting ay nagmi-minimize ng potential damage.' },
      { title: 'Software Updates', text: 'Ang software updates ay hindi lang para sa bagong features ΓÇö security patches ang pinakaimportante. Ang mga attackers ay nag-e-exploit ng known vulnerabilities na na-patch na ng updates.\n\n- I-install ang Windows/Mac updates within 48 hours\n- I-update ang apps at browser regularly\n- I-enable ang automatic updates\n- I-restart ang computer para ma-apply ang updates (ang "Postpone" ay nag-i-invite ng risk)\n\nWannaCry ransomware (2017): Naka-infect ng 200,000+ computers sa 150 countries dahil sa UNPATCHED Windows vulnerability.' },
      { title: 'Antivirus at Endpoint Protection', text: 'Ang antivirus ay mahalaga pero hindi sapat:\n\n- Huwag i-disable ang antivirus kahit bumagal ang computer\n- Huwag mag-install ng ibang antivirus bukod sa company-approved\n- Kung may alert ang antivirus, i-report agad sa IT ΓÇö huwag i-ignore\n- Huwag i-whitelist ang kahina-hinalang files\n- Kung may pop-up na "Virus detected! Call this number" ΓÇö SCAM ito. Tawagan ang IT, hindi ang number sa pop-up' },
      { title: 'Secure WiFi Usage', text: 'Ang WiFi ay isang common attack vector:\n\n- Huwag gumamit ng public WiFi (coffee shop, airport) nang walang VPN\n- I-verify ang official company WiFi SSID\n- Huwag gumamit ng "Free WiFi" na walang password ΓÇö pwedeng fake access point (Evil Twin attack)\n- I-disable ang auto-connect sa WiFi networks\n- Gamitin ang company VPN para sa remote work\n- I-forget ang WiFi networks pagkatapos gamitin\n\nKung kailangan mong gumamit ng public WiFi, gamitin ang mobile hotspot ng phone mo ΓÇö mas safe.' }
    ]
  },
  incident: {
    title: 'Incident Reporting',
    steps: [
      { title: 'Ano ang Security Incident?', text: 'Ang security incident ay anumang event na pwedeng maka-compromise sa confidentiality, integrity, o availability ng company data o systems.\n\nExamples:\n- Phishing email na na-click mo\n- Suspicious login attempt sa account mo\n- Nawala o nanakaw na device\n- Unexpected pop-up o ransomware message\n- May access ka sa data na hindi mo dapat nakikita\n- May nagtanong ng password mo\n- Nag-iiba ang behavior ng computer (biglang bumagal, may unknown programs)' },
      { title: 'Paano Mag-report', text: 'Kapag may na-detect kang security incident:\n\n1. Don\'t Panic ΓÇö importante ang kalmadong pag-report\n2. Don\'t Investigate Alone ΓÇö maaaring mag-destroy ng ebidensya\n3. Document Everything ΓÇö i-screenshot, i-note ang oras at details\n4. Disconnect ΓÇö i-disconnect sa network kung may malware (unplug ethernet, disable WiFi)\n5. Report ΓÇö tawagan ang IT department o mag-submit ng ticket\n\nContact Information:\n- IT Helpdesk: [internal number]\n- IT Manager: [name at number]\n- Available 24/7 para sa critical incidents' },
      { title: 'Ano ang Dapat Isama sa Report', text: 'Kapag nag-report ng incident, isama ang mga sumusunod:\n\n1. Kailan nangyari? (exact date and time)\n2. Saan? (anong system, app, o location)\n3. Ano ang nakita mo? (exact message, behavior, o alert)\n4. Ano ang ginawa mo pagkatapos?\n5. May iba pa bang apektado?\n6. I-attach ang screenshots kung meron\n\nHalimbawa: "Kaninang 10:30 AM, nakatanggap ako ng email na may subject "URGENT: Password Reset Required" mula sa "it-support@company-secure.net". Hindi ko ito ni-click at ni-report ko agad. Naka-attach ang screenshot."' },
      { title: 'Do\'s and Don\'ts', text: 'DO:\nΓ£ô I-report agad ΓÇö kahit hindi ka sure kung incident\nΓ£ô I-preserve ang ebidensya (screenshot, email forwarding)\nΓ£ô I-secure ang area (kung physical incident)\nΓ£ô Sumunod sa IT instructions\nΓ£ô Mag-document ng timeline ng events\n\nDON\'T:\nΓ£ù Huwag mag-panic at mag-share sa social media\nΓ£ù Huwag i-close o i-shutdown ang computer (maaaring mawala ang ebidensya)\nΓ£ù Huwag i-negotiate sa ransomware attackers\nΓ£ù Huwag subukang i-hack pabalik\nΓ£ù Huwag mag-delete ng logs o files\nΓ£ù Huwag mag-keep ng incident na secret ΓÇö REPORT IT' },
      { title: 'Post-Incident Best Practices', text: 'Pagkatapos ng incident:\n\n1. Makipag-cooperate sa IT investigation\n2. Mag-change ng passwords kung kinakailangan\n3. I-enroll o i-update ang MFA\n4. Sumali sa additional security training kung required\n5. I-refresh ang memory kung ano ang natutunan ΓÇö paano maiiwasan sa susunod\n6. Huwag matakot mag-report sa future ΓÇö ang pag-report ay HINDI punishment\n\nTandaan: Ang "blame-free culture" ay importante para mahikayat ang lahat na mag-report agad nang walang takot sa reprimand.' }
    ]
  },
  cloudsecurity: {
    title: 'Cloud at Remote Work Security',
    steps: [
      { title: 'Cloud Security Basics', text: 'Ang cloud security ay sumasaklaw sa mga patakaran at teknolohiya para protektahan ang data, applications, at infrastructure sa cloud. Ang shared responsibility model ay nangangahulugan na ang cloud provider (AWS, Azure, Google) ay responsible para sa security NG cloud, habang ikaw ay responsible para sa security SA cloud - kasama na ang access management, data encryption, at configuration.' },
      { title: 'Secure Cloud Storage', text: 'Kapag gumagamit ng cloud storage (OneDrive, Google Drive, Dropbox):\n- Gamitin ang company-approved cloud services, hindi personal accounts\n- I-set ang file permissions sa "Specific people" hindi "Anyone with the link"\n- Mag-set ng expiration dates sa shared links\n- Huwag mag-imbak ng highly confidential data sa cloud nang walang encryption\n- Regular na i-review ang shared files at i-revoke ang access na hindi na kailangan' },
      { title: 'VPN at Remote Access', text: 'Ang VPN (Virtual Private Network) ay nag-e-encrypt ng internet connection mo para hindi mabasa ng hackers ang data mo:\n- Gamitin ang company VPN palagi kapag nagtatrabaho remotely\n- Huwag gumamit ng free VPN services - maaaring magbenta ng data mo\n- Siguraduhing naka-activate ang VPN bago mag-access ng company resources\n- Kung may "kill switch" ang VPN, i-enable ito para automatic na ma-block ang internet kung mag-disconnect ang VPN\n- I-update ang VPN client regularly' },
      { title: 'Home Office Security', text: 'Kapag nagtatrabaho mula sa bahay:\n- I-secure ang home WiFi: change default router password, i-enable ang WPA3 encryption\n- Gumawa ng guest network para sa mga bisita - huwag ikabit ang work devices sa guest network\n- Ilagay ang router sa central location at i-update ang firmware\n- Huwag gumamit ng work computer para sa personal browsing\n- I-report agad ang kahina-hinalang network activity sa IT\n- Ihiwalay ang work devices sa personal devices hanggat maaari' },
      { title: 'Video Conferencing Security', text: 'Sa panahon ng remote work, ang video calls ay common attack vector:\n- Huwag i-share ang meeting links sa social media\n- Gamitin ang waiting room feature para i-verify ang attendees\n- Huwag mag-share ng screen na may sensitive info (i-check kung ano ang nakabukas)\n- I-lock ang meeting pagkatapos mag-start para hindi makapasok ang intruders\n- Gamitin ang end-to-end encryption kung available\n- Huwag mag-record ng meetings na may confidential discussion nang walang consent' }
    ]
  },
  mobilesecurity: {
    title: 'Mobile Security',
    steps: [
      { title: 'Mobile Threat Landscape', text: 'Ang smartphones at tablets ay naglalaman ng maraming personal at company data, pero madalas silang hindi nabibigyan ng sapat na security attention. Mga common mobile threats:\n- Malicious apps na nagnanakaw ng data\n- Mobile phishing (smishing) na mas hirap i-detect kaysa email\n- Public WiFi na ginagamit ng mobile devices\n- Lost o stolen devices na may sensitive data\n- Juice jacking (public charging stations na may malware)\nAng iyong phone ay isang computer - dapat tratuhin na may parehong security level.' },
      { title: 'App Security', text: 'Paano protektahan ang iyong mobile apps:\n- Mag-install lang ng apps mula sa official app stores (Google Play, App Store)\n- Basahin ang app permissions - bakit kailangan ng flashlight app ang contacts mo?\n- I-update ang apps regularly - ang updates ay may security patches\n- I-uninstall ang apps na hindi mo na ginagamit\n- Huwag mag-install ng APK files mula sa unknown sources (Android)\n- I-enable ang Google Play Protect o iOS security features\n- Mag-ingat sa "free" versions ng paid apps - maaaring may malware' },
      { title: 'BYOD at MDM', text: 'BYOD (Bring Your Own Device) policies:\n- Kung gagamitin ang personal phone para sa trabaho, sundin ang company BYOD policy\n- Ihiwalay ang work data sa personal data gamit ang MDM (Mobile Device Management)\n- Huwag i-jailbreak (iOS) o i-root (Android) ang phone - tinatanggal nito ang security layers\n- Mag-set ng work profile na naka-encrypt at hiwalay sa personal apps\n- Kapag umalis sa kompanya, ang work profile lang ang ireremote wipe ng IT, hindi ang buong phone' },
      { title: 'Mobile WiFi at Bluetooth', text: 'Ang mobile devices ay prone sa network attacks:\n- Huwag mag-auto-connect sa public WiFi networks\n- I-off ang WiFi at Bluetooth kapag hindi ginagamit (pinipigilan ang attackers na kumonekta)\n- Huwag mag-access ng company data sa public WiFi nang walang VPN\n- I-disable ang "WiFi hotspot" features kung hindi kailangan\n- Mag-ingat sa "Juice Jacking" - gumamit ng USB data blocker o power bank lang sa public charging\n- I-forget ang WiFi networks pagkatapos gamitin' },
      { title: 'Physical Mobile Security', text: 'Dahil maliit at madaling mawala ang phones:\n- Gumamit ng strong passcode (6+ digits), hindi pattern lock\n- I-enable ang biometric authentication (fingerprint, face ID)\n- I-enable ang "Find My Device" features (Find My iPhone, Google Find My Device)\n- Mag-set ng auto-lock - 1 minute or less na inactivity\n- Huwag i-save ang passwords sa notes app o sa browser nang walang master password\n- I-enable ang remote wipe capability para sa company data\n- Kung nawala ang phone, i-report agad sa IT para ma-remote wipe ang work data' }
    ]
  },
  emergingthreats: {
    title: 'AI at Emerging Threats',
    steps: [
      { title: 'AI-Powered Cyber Attacks', text: 'Gumagamit na ngayon ang mga cybercriminals ng Artificial Intelligence para gawing mas effective ang attacks:\n- AI-generated phishing emails na walang grammar errors at napaka-personalized\n- Automated vulnerability scanning gamit ang AI para mabilis makahanap ng weaknesses\n- AI-powered voice cloning para sa vishing attacks\n- Deepfake videos para i-impersonate ang CEO o executives\n- Machine learning na ginagamit para i-bypass ang security controls\nAng AI ay hindi lang para sa defenders - ginagamit din ito ng attackers.' },
      { title: 'Deepfakes at Misinformation', text: 'Ang deepfake ay AI-generated na video, audio, o image na mukhang totoo pero gawa-gawa lang:\n- May mga kaso na ginamit ang deepfake voice para mag-utos ng wire transfer (CEO fraud 2.0)\n- Ang mga deepfake ay nagiging mas mahirap i-detect kahit ng experts\n- Paano protektahan ang sarili: mag-verify sa ibang channel (tawagan ang tao gamit ang official number)\n- Magkaroon ng "code word" sa team para sa urgent financial transactions\n- I-report ang kahina-hinalang media sa IT o security team\n- Huwag agad maniwala sa shocking videos - i-check ang source at context' },
      { title: 'IoT Security', text: 'Ang Internet of Things (IoT) ay mga smart devices na naka-connect sa internet:\n- Smart TVs, smart speakers (Alexa, Google Home), smart lights, smart locks, cameras\n- Maraming IoT devices ang may WEAK security (default passwords, no updates)\n- Ang isang compromised smart TV ay pwedeng gamitin para ma-access ang home network\n- Best practices: ihiwalay ang IoT devices sa work devices gamit ang guest network\n- Palitan ang default passwords ng IoT devices\n- I-update ang firmware regularly\n- I-disable ang features na hindi ginagamit (remote access, microphone)' },
      { title: 'Supply Chain at Third-Party Risk', text: 'Hindi lang ang sariling security ang importante - pati na rin ang security ng vendors at partners:\n- Ang SolarWinds attack (2020) ay naka-compromise ng 18,000 organizations sa pamamagitan ng isang software update\n- Third-party data breaches ay maaaring makaapekto sa company data\n- Paano protektahan ang sarili: i-verify ang security practices ng vendors bago magbigay ng access\n- I-minimize ang data sharing sa third parties - "need to know" basis lang\n- I-monitor ang third-party access at i-revoke kung hindi na kailangan\n- I-report ang kahina-hinalang activity mula sa third-party tools' },
      { title: 'Zero-Day at Advanced Threats', text: 'Ang zero-day vulnerability ay isang security flaw na unknown pa sa vendor at walang available na patch:\n- Ang mga advanced persistent threats (APT) ay gumagamit ng zero-days para ma-access ang networks\n- Paano protektahan ang sarili:\n  1. I-update ang software agad kapag may patch\n  2. Magkaroon ng defense-in-depth approach (maraming layers of security)\n  3. Gamitin ang EDR (Endpoint Detection and Response) hindi lang antivirus\n  4. I-monitor ang unusual network activity\n  5. Magkaroon ng incident response plan na handa\n  6. I-educate ang sarili at ang team - ang awareness ay ang pinakamahusay na depensa' }
    ]
  }
};

const moduleIds = ['phishing','passwords','social','dataprotection','devicesecurity','incident','cloudsecurity','mobilesecurity','emergingthreats'];
const moduleIcons = ['ti ti-mail-warning','ti ti-key','ti ti-users','ti ti-shield-lock','ti ti-device-laptop','ti ti-flag','ti ti-cloud','ti ti-device-mobile','ti ti-alert-triangle'];
const moduleColors = ['#e24b4a','#ef9f27','#7c3aed','#1d4ed8','#1d9e75','#dc2626','#0ea5e9','#8b5cf6','#f43f5e'];
const moduleDesc = ['Kilalanin at iwasan ang phishing attacks','Gumawa ng strong passwords at gumamit ng MFA','Protektahan ang sarili laban sa social engineering','I-secure ang company data sa tamang paraan','Panatilihing safe ang iyong devices','Alamin kung paano at kailan mag-report','Safe na paggamit ng cloud at remote work tools','I-secure ang iyong smartphone at tablet','AI, deepfakes, at mga bagong uri ng banta'];


const moduleSvgs = [
  '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="#fef2f2"/><path d="M30 37h40v26H30z" fill="#fff" stroke="#e24b4a" stroke-width="2"/><path d="M30 37l20 13 20-13" stroke="#e24b4a" stroke-width="2" fill="none"/><circle cx="65" cy="33" r="8" fill="#e24b4a" opacity="0.8"/><path d="M62 33h6M65 30v6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="#fef9ee"/><rect x="35" y="40" width="30" height="24" rx="3" fill="#fff" stroke="#ef9f27" stroke-width="2"/><circle cx="50" cy="50" r="4" fill="#ef9f27"/><rect x="47" y="50" width="6" height="8" rx="1" fill="#ef9f27"/><path d="M28 52l6-4M72 52l-6-4" stroke="#ef9f27" stroke-width="2" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="#f3e8ff"/><circle cx="50" cy="36" r="12" fill="#fff" stroke="#7c3aed" stroke-width="2"/><path d="M34 64c0-10 7-18 16-18s16 8 16 18" fill="#fff" stroke="#7c3aed" stroke-width="2"/><circle cx="50" cy="36" r="4" fill="#7c3aed"/><path d="M38 36l-6-3M62 36l6-3" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="#eff6ff"/><path d="M50 25l20 8v14c0 12-8 23-20 26-12-3-20-14-20-26V33l20-8z" fill="#fff" stroke="#1d4ed8" stroke-width="2"/><path d="M44 50l4 4 8-8" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="#e6f9f0"/><rect x="30" y="30" width="40" height="28" rx="3" fill="#fff" stroke="#1d9e75" stroke-width="2"/><rect x="33" y="34" width="34" height="18" rx="1" fill="#e6f9f0"/><circle cx="50" cy="56" r="3" fill="#1d9e75"/><path d="M35 44h30" stroke="#1d9e75" stroke-width="1.5"/><path d="M62 30v-4H38v4" stroke="#1d9e75" stroke-width="1.5"/></svg>',
  '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="#fef2f2"/><path d="M50 25l25 50H25l25-50z" fill="#fff" stroke="#dc2626" stroke-width="2" stroke-linejoin="round"/><path d="M50 45v12" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/><circle cx="50" cy="64" r="2" fill="#dc2626"/></svg>',
  '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="#ecfeff"/><path d="M34 54c0-7 5-12 12-12 2-6 9-10 16-8 5-4 14-2 15 6 5 1 8 6 7 12" fill="#fff" stroke="#0ea5e9" stroke-width="2"/><path d="M34 54c-3 0-6 3-6 7s3 7 6 7h28c4 0 7-3 7-7s-3-7-7-7" stroke="#0ea5e9" stroke-width="2"/><path d="M48 57l4 4 8-8" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="#f3e8ff"/><rect x="36" y="28" width="28" height="44" rx="4" fill="#fff" stroke="#8b5cf6" stroke-width="2"/><circle cx="50" cy="63" r="2.5" fill="#8b5cf6"/><rect x="41" y="32" width="18" height="22" rx="2" fill="#ede9fe"/><path d="M46 40l4 4 8-8" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" fill="#fff1f2"/><path d="M50 28l6 12 14 2-10 10 2 14-12-6-12 6 2-14-10-10 14-2 6-12z" fill="#fff" stroke="#f43f5e" stroke-width="2" stroke-linejoin="round"/><circle cx="50" cy="46" r="3" fill="#f43f5e"/><path d="M50 51v8" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/></svg>'
];

const quizData = {
  phishing: [
    { q: 'Ano ang phishing?', options: ['Isang uri ng fishing sa dagat', 'Cyber attack na nagpapanggap bilang lehitimong entity', 'Isang programming language', 'Antivirus software'], answer: 1 },
    { q: 'Ano ang HINDI red flag ng phishing email?', options: ['Generic greeting', 'Urgent tone', 'Personalized greeting gamit ang pangalan mo', 'Suspicious sender address'], answer: 2 },
    { q: 'Paano mo ma-ve-verify ang isang link bago i-click?', options: ['I-click at tingnan kung safe', 'I-hover ang mouse para makita ang actual URL', 'I-copy at i-paste sa browser', 'I-share sa katrabaho para i-check nila'], answer: 1 },
    { q: 'Ano ang tawag sa phishing via SMS?', options: ['Vishing', 'Smishing', 'Spear phishing', 'Whaling'], answer: 1 },
    { q: 'Ano ang dapat mong gawin kapag nakatanggap ka ng phishing email?', options: ['Reply-an para sabihin na scam ito', 'I-click ang unsubscribe link', 'I-report sa IT at i-delete', 'I-forward sa lahat ng kakilala bilang warning'], answer: 2 }
  ],
  passwords: [
    { q: 'Ilang characters ang minimum na haba ng strong password?', options: ['6', '8', '12', '16'], answer: 2 },
    { q: 'Ano ang pinaka-secure na MFA method?', options: ['SMS code', 'Email code', 'Authenticator app', 'Security question'], answer: 2 },
    { q: 'Ayon sa NIST, kailan dapat mag-change ng password?', options: ['Every 30 days', 'Every 90 days', 'Every 6 months', 'Kung may evidence ng compromise'], answer: 3 },
    { q: 'Ano ang password manager?', options: ['Tool para mag-generate at mag-save ng passwords', 'Tool para manakaw ng passwords', 'Antivirus software', 'Browser extension lang'], answer: 0 },
    { q: 'Alin ang malakas na password?', options: ['password123', 'Admin2024!', 'C0ff33!Mug#2024$P1ease', 'June151990'], answer: 2 }
  ],
  social: [
    { q: 'Ano ang social engineering?', options: ['Engineering ng social media', 'Psychological manipulation para magbigay ng confidential info', 'Networking event', 'Team building activity'], answer: 1 },
    { q: 'Ano ang tailgating sa security context?', options: ['Sumusunod sa sasakyan', 'Sumusunod sa empleyado papasok sa restricted area', 'Nagme-message sa Instagram', 'Nagsha-share ng files'], answer: 1 },
    { q: 'Ano ang tawag sa phishing na naka-target sa CEO?', options: ['Spear phishing', 'Whaling', 'Vishing', 'Clone phishing'], answer: 1 },
    { q: 'Dapat ka bang magbigay ng password kapag may tumawag na nagsasabing "IT Support ito"?', options: ['Oo, para ma-verify ang account', 'Oo, kung urgent', 'Hindi, IT ay NEVER hihingi ng password', 'Oo, kung alam nila ang pangalan ko'], answer: 2 },
    { q: 'Paano mo ma-ve-verify ang identity ng isang tao na nagsasabing galing sa IT?', options: ['Bigyan ng benefit of the doubt', 'Tawagan ang official IT hotline', 'I-google ang number nila', 'I-text ang number nila'], answer: 1 }
  ],
  dataprotection: [
    { q: 'Ano ang pinaka-sensitive na data classification?', options: ['Public', 'Internal', 'Confidential', 'Restricted'], answer: 3 },
    { q: 'Ano ang tamang paraan para mag-share ng sensitive files?', options: ['Email attachment', 'OneDrive/SharePoint na may specific permissions', 'USB drive', 'Personal Google Drive'], answer: 1 },
    { q: 'Ano ang encryption?', options: ['Pag-delete ng files', 'Pag-convert ng data sa code para hindi mabasa ng unauthorized', 'Pag-compress ng files', 'Pag-backup ng data'], answer: 1 },
    { q: 'Ano ang clean desk policy?', options: ['Mag-linis ng desk araw-araw', 'Huwag mag-iwan ng sensitive info sa desk', 'Mag-ayos ng files', 'Mag-decorate ng desk'], answer: 1 },
    { q: 'Ano ang dapat gawin kapag may data breach?', options: ['Itago na lang', 'I-report agad sa IT at DPO', 'I-delete ang ebidensya', 'Mag-resign'], answer: 1 }
  ],
  devicesecurity: [
    { q: 'Ano ang shortcut para i-lock ang Windows computer?', options: ['Ctrl+Alt+Del', 'Windows+L', 'Alt+F4', 'Ctrl+Shift+Esc'], answer: 1 },
    { q: 'Ano ang dapat mong gawin kapag nawala ang company laptop?', options: ['Maghanap muna bago mag-report', 'I-report agad sa IT within 1 hour', 'Bumili ng bago', 'I-post sa social media'], answer: 1 },
    { q: 'Bakit importante ang software updates?', options: ['Para sa bagong features lang', 'Para ma-fix ang security vulnerabilities', 'Para gumanda ang interface', 'Para bumilis ang computer'], answer: 1 },
    { q: 'Ano ang dapat gawin kapag may antivirus alert?', options: ['I-ignore', 'I-disable ang antivirus', 'I-report agad sa IT', 'I-dismiss ang alert'], answer: 2 },
    { q: 'Safe bang gumamit ng public WiFi nang walang VPN?', options: ['Oo, safe naman', 'Hindi, pwedeng ma-intercept ang data', 'Oo, kung naka-login sa accounts', 'Oo, kung malakas ang signal'], answer: 1 }
  ],
  incident: [
    { q: 'Ano ang security incident?', options: ['Anumang event na pwedeng maka-compromise sa security', 'Virus lang', 'Password reset', 'Software installation'], answer: 0 },
    { q: 'Ano ang UNA mong dapat gawin kapag may na-detect na incident?', options: ['Mag-panic', 'I-report sa IT', 'I-investigate mag-isa', 'I-shutdown ang computer'], answer: 1 },
    { q: 'Alin ang dapat mong isama sa incident report?', options: ['Oras at petsa ng incident', 'Screenshots', 'Ano ang ginawa mo', 'Lahat ng nabanggit'], answer: 3 },
    { q: 'Ano ang HINDI dapat gawin sa security incident?', options: ['Mag-report agad', 'I-preserve ang ebidensya', 'I-post sa Facebook', 'Sumunod sa IT instructions'], answer: 2 },
    { q: 'Ano ang blame-free culture?', options: ['Walang may kasalanan', 'Huwag sisihin ang nag-report para mahikayat ang iba na mag-report', 'Laging may parusa', 'Hindi na kailangan ng investigation'], answer: 1 }
  ],
  cloudsecurity: [
    { q: 'Ano ang shared responsibility model sa cloud?', options: ['Cloud provider lang ang responsible', 'Ikaw lang ang responsible', 'Cloud provider: security NG cloud, Ikaw: security SA cloud', 'Walang may responsibility'], answer: 2 },
    { q: 'Ano ang tamang paraan ng pag-share ng file sa cloud?', options: ['"Anyone with the link"', '"Specific people" na may expiration date', 'I-post sa Facebook', 'I-email sa lahat ng employees'], answer: 1 },
    { q: 'Bakit mahalaga ang VPN sa remote work?', options: ['Para bumilis ang internet connection', 'Para ma-encrypt ang data at protektahan ito', 'Para ma-access ang Facebook', 'Para itago ang location'], answer: 1 },
    { q: 'Ano ang dapat gawin para i-secure ang home WiFi?', options: ['Iwan ang default admin password', 'Palitan ang default password at i-enable ang WPA3', 'I-share ang password sa lahat ng kapitbahay', 'I-off ang WiFi router'], answer: 1 },
    { q: 'Ano ang "Zoom bombing"?', options: ['Pagsabog ng Zoom app', 'Hindi awtorisadong tao na pumapasok sa meeting', 'Pagre-record ng meeting', 'Pag-share ng screen'], answer: 1 }
  ],
  mobilesecurity: [
    { q: 'Saan dapat mag-install ng mobile apps?', options: ['Sa kahit anong website', 'Sa official app stores (Google Play, App Store)', 'Sa email attachments', 'Sa USB drive'], answer: 1 },
    { q: 'Ano ang ibig sabihin ng BYOD?', options: ['Buy Your Own Device', 'Bring Your Own Device', 'Build Your Own Device', 'Backup Your Own Data'], answer: 1 },
    { q: 'Ano ang "Juice Jacking"?', options: ['Pagnanakaw ng juice sa pantry', 'Pagnanakaw ng data sa public USB charging', 'Pag-charge ng phone sa bahay', 'Pagbili ng juice sa vending machine'], answer: 1 },
    { q: 'Anong klaseng passcode ang pinaka-secure para sa phone?', options: ['4-digit PIN lang', 'Pattern lock', '6-digit o mas mahaba pang passcode', 'Walang passcode'], answer: 2 },
    { q: 'Ano ang dapat gawin kapag nawala ang company phone?', options: ['Bumili ng bagong phone', 'I-report agad sa IT para ma-remote wipe', 'Maghanap muna ng ilang araw', 'Kalimutan na lang at bumili ng bago'], answer: 1 }
  ],
  emergingthreats: [
    { q: 'Ano ang deepfake?', options: ['Isang uri ng fake news sa social media', 'AI-generated video/audio/image na mukhang totoo', 'Isang programming language', 'Isang antivirus software'], answer: 1 },
    { q: 'Paano mo ma-ve-verify kung legit ang isang urgent request mula sa CEO?', options: ['Reply-an agad ang email', 'Tawagan ang CEO gamit ang official company number', 'I-share sa social media', 'I-ignore na lang ang request'], answer: 1 },
    { q: 'Ano ang pinakamagandang paraan para i-secure ang IoT devices?', options: ['Iwan ang default settings', 'Palitan ang default password at ihiwalay sa work network', 'I-connect lahat sa work network', 'I-off lahat ng security features'], answer: 1 },
    { q: 'Ano ang supply chain attack?', options: ['Pag-atake sa physical supply chain', 'Pag-compromise ng vendor para ma-access ang target', 'Pag-atake sa grocery store chain', 'Pag-delete ng files sa computer'], answer: 1 },
    { q: 'Ano ang pinakamahusay na depensa laban sa zero-day attacks?', options: ['Maghintay na may mag-patch', 'Defense-in-depth approach at regular updates', 'I-off na lang ang computer', 'Mag-install ng maraming antivirus'], answer: 1 }
  ]
};

const scenarioData = {
  'phishing-spot': {
    title: 'Spot the Phishing Email',
    desc: 'Exercise: Nakatanggap ka ng email mula sa "IT Security Team" na nagsasabing kailangan mong i-verify ang account mo agad. Suriin ang email at gawin ang tamang aksyon.',
    steps: [
      { text: 'Tingnan ang sender address: "it-security@kalyx-secure.net" ΓÇö hindi ito ang official domain ng kompanya (kalyx.com). Ito ay red flag.' },
      { text: 'I-hover ang link: "https://kalyx-verify.com" ΓÇö hindi ito ang official company portal. Huwag i-click.' },
      { text: 'Suriin ang tono: "Your account will be DISABLED in 24 hours!" ΓÇö ito ay urgency tactic para hindi ka mag-isip nang mabuti.' },
      { text: 'Suriin ang grammar: "Please to click the link for verify your account" ΓÇö may grammatical errors.' },
      { text: 'I-report ang email sa IT department gamit ang "Report Phishing" button sa Outlook o sa pamamagitan ng ticket.' },
      { text: 'Γ£à Mahusay! Hindi ka nag-click ng kahit ano at na-report mo ang phishing email. I-delete ang email pagkatapos mag-report.' }
    ]
  },
  'social-defense': {
    title: 'Respond to a Social Engineering Attempt',
    desc: 'Exercise: May tumawag na nagpapakilalang "Mark from IT" at humihingi ng password mo para ma-resolve ang "urgent security issue" sa account mo.',
    steps: [
      { text: 'Huwag magbigay ng kahit anong impormasyon. Sabihin na tatawagan mo siya pabalik.' },
      { text: 'I-check ang caller ID. Unknown number? Hindi galing sa internal company directory? Ito ay red flag.' },
      { text: 'Tawagan ang official IT hotline (hindi ang number na ginamit niya para tawagan ka) at i-verify kung may legitimate issue.' },
      { text: 'I-report ang incident sa IT department kasama ang details: number na tumawag, sinabi niya, oras ng tawag.' },
      { text: 'I-notify ang teammates para aware sila sa social engineering attempt na ito.' },
      { text: 'Γ£à Magaling! Hindi ka na-scam at na-report mo ang incident. AngΦ¡ªµâò (vigilance) ay pinakamahusay na depensa.' }
    ]
  },
  'device-loss': {
    title: 'Lost Device Protocol',
    desc: 'Exercise: Nawala mo ang company laptop sa coffee shop. What do you do?',
    steps: [
      { text: 'Huminahon at balikan ang coffee shop. Magtanong sa staff kung may nakitang laptop.' },
      { text: 'Kung hindi na mahanap, i-report agad sa IT department. Time is critical ΓÇö within 1 hour dapat naka-report na.' },
      { text: 'Huwag subukang i-locate ang laptop nang mag-isa. Huwag i-remote wipe kung hindi in-utusan ng IT (maaaring i-delete ang ebidensya).' },
      { text: 'Mag-change ng passwords sa lahat ng accounts na logged in sa laptop (email, VPN, cloud services).' },
      { text: 'Coordinate sa IT para sa remote wipe ng device. Kung naka-BitLocker/FileVault ang laptop, safe ang data kahit makuha ng iba.' },
      { text: 'Γ£à Tama! Ang mabilis na reporting at password change ay nagmi-minimize ng potential damage. Kung naka-encrypt ang laptop, safe ang company data.' }
    ]
  },
  'ransomware': {
    title: 'Ransomware Response',
    desc: 'Exercise: Biglang nag-freeze ang computer mo at may lumabas na red screen na nagsasabing "YOUR FILES ARE ENCRYPTED. Pay 1 BTC within 24 hours or lose all data."',
    steps: [
      { text: 'HUWAG MAG-PANIC. Huwag i-shutdown ang computer (maaaring mawala ang ebidensya). Huwag bayaran ang ransom.' },
      { text: 'I-disconnect agad ang computer sa network: tanggalin ang ethernet cable at i-disable ang WiFi. Ito ay pumipigil sa pag-spread ng ransomware sa ibang computers.' },
      { text: 'Kumuha ng litrato ng ransom screen gamit ang phone (para may ebidensya). Huwag gamitin ang infected computer para mag-selfie.' },
      { text: 'I-report agad sa IT department. Call, huwag mag-email (baka hindi ma-deliver ang email dahil sa network disconnect).' },
      { text: 'Hintayin ang IT instructions. Huwag subukang i-decrypt ang files nang mag-isa. I-document kung ano ang ginawa mo bago magka-ransomware.' },
      { text: 'Γ£à Magaling! Hindi ka nag-panic, na-isolate mo ang infected computer, at na-report mo agad. Ang backup ng kompanya ang magre-restore ng files mo.' }
    ]
  },
  'vishing-call': {
    title: 'Vishing Call Response',
    desc: 'Exercise: May tumawag sa iyo na nagpapakilalang "John from IT Security" at sinasabing may suspicious login attempt sa account mo. Kailangan mong i-verify ang identity mo sa pamamagitan ng pagbigay ng One-Time PIN (OTP) na ipapadala sa phone mo.',
    steps: [
      { text: 'Huwag magbigay ng kahit anong OTP o verification code. Ang lehitimong IT ay HINDI hihingi ng OTP mo.' },
      { text: 'I-check ang caller ID. Unknown o Private Number? Hindi galing sa internal directory? Red flag.' },
      { text: 'Sabihin na tatawagan mo ang IT department sa official hotline. I-verify ang number sa company intranet.' },
      { text: 'Tawagan ang IT hotline at i-report ang vishing attempt. Ibigay ang number na tumawag at ang sinabi nila.' },
      { text: 'Kung hindi maabot ang IT, i-report sa manager o HR. Huwag hintaying may mangyari bago mag-report.' },
      { text: 'Mahusay! Hindi ka nagbigay ng OTP at na-report mo ang vishing attempt. Ang pagiging alerto ay pumipigil sa account takeover.' }
    ]
  },
  'usb-baiting': {
    title: 'Suspicious USB Drive',
    desc: 'Exercise: Nakakita ka ng USB drive sa parking lot ng office. May label itong "Confidential - Q4 Salary Adjustments". Ano ang gagawin mo?',
    steps: [
      { text: 'HUWAG ISAKSAK SA COMPUTER. Ang USB baiting ay social engineering tactic kung saan nag-iiwan ang attacker ng infected USB drive.' },
      { text: 'I-check kung may company logo ang USB drive. Kung wala, malamang galing ito sa stranger.' },
      { text: 'Dalhin ang USB drive sa IT department o security office. Huwag subukang buksan ang contents.' },
      { text: 'I-report kung saan at kailan mo ito nakita. Ang impormasyon ay makakatulong sa investigation.' },
      { text: 'I-notify ang mga katrabaho na huwag isaksak ang kahit anong unknown USB drives sa kanilang computers.' },
      { text: 'Tama! Hindi mo isinaksak ang unknown USB drive at dinala mo ito sa IT. Ang USB drives ay pwedeng maglaman ng malware na automatic na magra-run kapag isinaksak (autorun).' }
    ]
  }
};

// ====== PROGRESS ======
function getProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch(e) { return {}; }
}
function saveProgress(key, subkey, value) {
  const p = getProgress();
  if (!p[key]) p[key] = {};
  p[key][subkey] = value;
  p._updated = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  updateAllDisplays();
}
function getModuleProgress(id) {
  const p = getProgress();
  const m = p.modules && p.modules[id];
  if (!m || !m.steps) return { completed: 0, total: lessons[id].steps.length, steps: [] };
  return { completed: m.steps.filter(Boolean).length, total: lessons[id].steps.length, steps: m.steps };
}

// ====== ACTIVITY LOG ======
function addActivity(text) {
  const p = getProgress();
  if (!p.activity) p.activity = [];
  p.activity.unshift({ text: text, time: Date.now() });
  if (p.activity.length > 50) p.activity = p.activity.slice(0, 50);
  p._updated = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  updateAllDisplays();
}

// ====== ACHIEVEMENTS ======
const achievementDefs = [
  { id: 'first-module', label: 'First Steps', desc: 'Complete your first training module', icon: 'ti ti-star' },
  { id: 'all-modules', label: 'Scholar', desc: 'Complete all 9 training modules', icon: 'ti ti-books' },
  { id: 'first-quiz', label: 'Quiz Novice', desc: 'Pass your first quiz (80%+)', icon: 'ti ti-checklist' },
  { id: 'all-quizzes', label: 'Quiz Master', desc: 'Pass all 9 quizzes (80%+)', icon: 'ti ti-award' },
  { id: 'first-scenario', label: 'Scenario Solver', desc: 'Complete your first scenario', icon: 'ti ti-tasks' },
  { id: 'all-scenarios', label: 'Scenario Expert', desc: 'Complete all 6 scenarios', icon: 'ti ti-medal' },
  { id: 'perfect-quiz', label: 'Perfect Score', desc: 'Get 100% on any quiz', icon: 'ti ti-crown' },
  { id: 'half-progress', label: 'Halfway There', desc: 'Reach 50% overall progress', icon: 'ti ti-flag' }
];

function checkAchievements() {
  const p = getProgress();
  if (!p.achievements) p.achievements = {};
  const mods = p.modules || {};
  const quizzes = p.quizzes || {};
  const scen = p.scenarios || {};
  const modDone = moduleIds.filter(id => {
    const mp = getModuleProgress(id);
    return mp.completed === mp.total;
  }).length;
  const quizPassed = moduleIds.filter(id => {
    const q = quizzes[id];
    return q && q.correct / q.total >= 0.8;
  }).length;
  const scenDone = Object.keys(scenarioData).filter(k => scen[k] && scen[k].completed).length;
  const allModsDone = modDone === moduleIds.length;
  const allQuizzesDone = quizPassed === moduleIds.length;
  const allScenariosDone = scenDone === Object.keys(scenarioData).length;
  const totalSteps = moduleIds.reduce((s,id) => s + lessons[id].steps.length, 0);
  const doneSteps = moduleIds.reduce((s,id) => s + getModuleProgress(id).completed, 0);
  const pct = totalSteps ? Math.round(doneSteps / totalSteps * 100) : 0;

  if (!p.achievements['first-module'] && modDone >= 1) unlockAchievement('first-module');
  if (!p.achievements['all-modules'] && allModsDone) unlockAchievement('all-modules');
  if (!p.achievements['first-quiz'] && quizPassed >= 1) unlockAchievement('first-quiz');
  if (!p.achievements['all-quizzes'] && allQuizzesDone) unlockAchievement('all-quizzes');
  if (!p.achievements['first-scenario'] && scenDone >= 1) unlockAchievement('first-scenario');
  if (!p.achievements['all-scenarios'] && allScenariosDone) unlockAchievement('all-scenarios');
  if (!p.achievements['half-progress'] && pct >= 50) unlockAchievement('half-progress');
  Object.keys(quizzes).forEach(k => {
    const q = quizzes[k];
    if (!p.achievements['perfect-quiz'] && q && q.total > 0 && q.correct === q.total) unlockAchievement('perfect-quiz');
  });
}
function unlockAchievement(id) {
  const p = getProgress();
  if (!p.achievements) p.achievements = {};
  if (p.achievements[id]) return;
  p.achievements[id] = { unlockedAt: Date.now() };
  p._updated = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  addActivity('≡ƒÅå Achieved: ' + achievementDefs.find(a => a.id === id).label);
  showToast('≡ƒÅå Achievement unlocked: ' + achievementDefs.find(a => a.id === id).label);
}

// ====== TOAST ======
function showToast(msg, isError) {
  const t = document.createElement('div');
  t.className = 'toast' + (isError ? ' error' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 3000);
}

// ====== PANEL SWITCHING ======
function switchPanel(id, el) {
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('panel-' + id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  if (el) el.classList.add('active');
  document.getElementById('breadcrumb').innerHTML = '<strong>' +
    ({ home:'Home', training:'Training Center', progress:'My Progress' }[id] || 'Home') + '</strong>';
  if (id === 'training') updateTrainingDisplays();
  if (id === 'progress') updateProgressPage();
}

// ====== TAB SWITCHING ======
function switchTab(tab, el) {
  document.querySelectorAll('#panel-training .tab-content').forEach(function(t) { t.classList.remove('active'); });
  document.getElementById('tab-' + tab).classList.add('active');
  document.querySelectorAll('#panel-training .tab-btn').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  updateTrainingDisplays();
}

// ====== UPDATE DISPLAYS ======
function updateAllDisplays() {
  const p = getProgress();
  const mods = p.modules || {};
  const quizzes = p.quizzes || {};
  const scen = p.scenarios || {};

  const modDone = moduleIds.filter(function(id) {
    const mp = getModuleProgress(id);
    return mp.completed === mp.total;
  }).length;
  const quizPassed = moduleIds.filter(function(id) {
    const q = quizzes[id];
    return q && q.correct / q.total >= 0.8;
  }).length;
  const scenDone = Object.keys(scenarioData).filter(function(k) { return scen[k] && scen[k].completed; }).length;

  const totalSteps = moduleIds.reduce(function(s,id) { return s + lessons[id].steps.length; }, 0);
  const doneSteps = moduleIds.reduce(function(s,id) { return s + getModuleProgress(id).completed; }, 0);
  const pct = totalSteps ? Math.round(doneSteps / totalSteps * 100) : 0;

  document.getElementById('homeModulesDone').textContent = modDone + '/' + moduleIds.length;
  document.getElementById('homeQuizzesDone').textContent = quizPassed + '/' + moduleIds.length;
  document.getElementById('homeScenariosDone').textContent = scenDone + '/' + Object.keys(scenarioData).length;
  document.getElementById('homeProgressPct').textContent = pct + '%';
  document.getElementById('homeProgressBar').style.width = pct + '%';

  var trainingBadge = document.getElementById('trainingNavBadge');
  if (trainingBadge) {
    trainingBadge.textContent = pct > 0 ? pct + '%' : 'NEW';
  }

  var html = '';
  moduleIds.forEach(function(id) {
    const mp = getModuleProgress(id);
    const pct2 = mp.total ? Math.round(mp.completed / mp.total * 100) : 0;
    const status = mp.completed === 0 ? 'Not started' : mp.completed === mp.total ? 'Γ£à Complete' : mp.completed + '/' + mp.total + ' done';
    html += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:13px;"><span style="width:90px;font-weight:500;color:#1a2332">' + lessons[id].title + '</span><div style="flex:1"><div class="progress-bar"><div class="progress-fill" style="width:' + pct2 + '%"></div></div></div><span style="color:#6b7a8d;font-size:12px;min-width:90px;text-align:right">' + status + '</span></div>';
  });
  document.getElementById('homeModuleProgress').innerHTML = html;

  var acts = p.activity || [];
  if (acts.length === 0) {
    document.getElementById('homeActivityLog').innerHTML = '<div style="color:#9aa3ad;text-align:center;padding:10px">No activity yet.</div>';
  } else {
    document.getElementById('homeActivityLog').innerHTML = acts.slice(0, 10).map(function(a) {
      return '<div class="activity-item">' + a.text + '</div>';
    }).join('');
  }
}

function updateTrainingDisplays() {
  renderModuleGrid();
  renderQuizGrid();
  renderScenarioGrid();
}

function renderModuleGrid() {
  const el = document.getElementById('moduleGrid');
  el.innerHTML = moduleIds.map(function(id, i) {
    const mp = getModuleProgress(id);
    const pct = mp.total ? Math.round(mp.completed / mp.total * 100) : 0;
    const cls = mp.completed === mp.total ? 'completed' : mp.completed > 0 ? 'in-progress' : '';
    const status = mp.completed === 0 ? 'Not started' : mp.completed === mp.total ? '✅ Completed (' + mp.total + '/' + mp.total + ')' : mp.completed + '/' + mp.total + ' steps';
    const svg = moduleSvgs[i];
    return '<div class="module-card ' + cls + '" onclick="startLesson(\'' + id + '\')"><div class="module-illustration">' + svg + '</div><div class="module-card-title"><i class="' + moduleIcons[i] + '" style="color:' + moduleColors[i] + '"></i> ' + lessons[id].title + '</div><div class="module-card-desc">' + moduleDesc[i] + '</div><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div><div style="margin-top:6px"><span class="module-card-status">' + status + '</span></div></div>';
  }).join('');
}

function renderQuizGrid() {
  const el = document.getElementById('quizGrid');
  const p = getProgress();
  const quizzes = p.quizzes || {};
  el.innerHTML = moduleIds.map(function(id, i) {
    const q = quizzes[id];
    const score = q ? q.correct + '/' + q.total : null;
    const passed = q && q.correct / q.total >= 0.8;
    const badgeCls = passed ? 'badge-green' : q ? 'badge-red' : 'badge-gray';
    const label = passed ? 'Γ£à Passed (' + score + ')' : q ? 'Γ¥î ' + score : 'Not taken';
    return '<div class="module-card" onclick="startQuiz(\'' + id + '\')"><div class="module-card-title"><i class="' + moduleIcons[i] + '" style="color:' + moduleColors[i] + '"></i> ' + lessons[id].title + ' Quiz</div><div class="module-card-desc">5 questions ΓÇö ' + moduleDesc[i] + '</div><div style="margin-top:8px"><span class="badge ' + badgeCls + '">' + label + '</span></div></div>';
  }).join('');
}

function renderScenarioGrid() {
  const el = document.getElementById('scenarioGrid');
  const p = getProgress();
  const scen = p.scenarios || {};
  el.innerHTML = Object.keys(scenarioData).map(function(k) {
    const s = scenarioData[k];
    const done = scen[k] && scen[k].completed;
    const cls = done ? 'completed' : '';
    return '<div class="module-card ' + cls + '" onclick="startScenario(\'' + k + '\')"><div class="module-card-title"><i class="ti ti-tasks" style="color:#7c3aed"></i> ' + s.title + '</div><div class="module-card-desc">' + s.desc.substring(0, 80) + '...</div><div style="margin-top:8px"><span class="module-card-status">' + (done ? 'Γ£à Completed' : 'Not started') + '</span></div></div>';
  }).join('');
}

function updateProgressPage() {
  const p = getProgress();
  const mods = p.modules || {};
  const quizzes = p.quizzes || {};
  const scen = p.scenarios || {};

  const modDone = moduleIds.filter(function(id) {
    const mp = getModuleProgress(id);
    return mp.completed === mp.total;
  }).length;
  const quizPassed = moduleIds.filter(function(id) {
    const q = quizzes[id];
    return q && q.correct / q.total >= 0.8;
  }).length;
  const scenDone = Object.keys(scenarioData).filter(function(k) { return scen[k] && scen[k].completed; }).length;

  document.getElementById('progressModules').textContent = modDone + '/' + moduleIds.length;
  document.getElementById('progressQuizzes').textContent = quizPassed + '/' + moduleIds.length;
  document.getElementById('progressScenarios').textContent = scenDone + '/' + Object.keys(scenarioData).length;

  document.getElementById('progressModulesPill').textContent = modDone === 0 ? 'Not started' : modDone === moduleIds.length ? 'Γ£à All complete' : modDone + ' done';
  document.getElementById('progressModulesPill').className = 'pill ' + (modDone === 0 ? 'pill-gray' : modDone === moduleIds.length ? 'pill-green' : 'pill-blue');
  document.getElementById('progressQuizzesPill').textContent = quizPassed === 0 ? 'Not started' : quizPassed === moduleIds.length ? 'Γ£à All passed' : quizPassed + ' passed';
  document.getElementById('progressQuizzesPill').className = 'pill ' + (quizPassed === 0 ? 'pill-gray' : quizPassed === moduleIds.length ? 'pill-green' : 'pill-amber');
  document.getElementById('progressScenariosPill').textContent = scenDone === 0 ? 'Not started' : scenDone === Object.keys(scenarioData).length ? 'Γ£à All complete' : scenDone + ' done';
  document.getElementById('progressScenariosPill').className = 'pill ' + (scenDone === 0 ? 'pill-gray' : scenDone === Object.keys(scenarioData).length ? 'pill-green' : 'pill-blue');

  var achHtml = achievementDefs.map(function(a) {
    const unlocked = p.achievements && p.achievements[a.id];
    return '<div class="achievement ' + (unlocked ? 'unlocked' : 'locked') + '"><i class="' + a.icon + '"></i> ' + a.label + '</div>';
  }).join('');
  document.getElementById('achievementsList').innerHTML = achHtml || '<div style="color:#9aa3ad;text-align:center">No achievements yet.</div>';

  var acts = p.activity || [];
  document.getElementById('progressActivityLog').innerHTML = acts.length === 0
    ? '<div style="color:#9aa3ad;text-align:center">No activity yet.</div>'
    : acts.slice(0, 30).map(function(a) {
        return '<div class="activity-item">' + a.text + '</div>';
      }).join('');
}

// ====== LESSON MODULE ======
var activeLesson = null;
var lessonStepIdx = 0;

function startLesson(id) {
  activeLesson = id;
  lessonStepIdx = 0;
  document.getElementById('lessonTitle').textContent = lessons[id].title;
  document.getElementById('lessonNextBtn').textContent = 'Next ΓåÆ';
  showLessonStep();
  document.getElementById('lessonOverlay').classList.add('open');
}

function showLessonStep() {
  var lesson = lessons[activeLesson];
  var steps = lesson.steps;
  var idx = lessonStepIdx;
  var mp = getModuleProgress(activeLesson);
  var done = mp.steps && mp.steps[idx];

  var modIdx = moduleIds.indexOf(activeLesson);
  var svgHtml = modIdx >= 0 ? '<div class="lesson-illustration">' + moduleSvgs[modIdx] + '</div>' : '';
  var html = svgHtml + '<div class="quiz-progress">Step ' + (idx + 1) + ' of ' + steps.length + '</div>';
  var st = steps[idx];
  html += '<div class="scenario-step" style="margin-bottom:16px"><div class="scenario-step-content"><div><span class="scenario-step-num">' + (idx + 1) + '</span></div><div class="scenario-step-text">';
  if (done) {
    html += '<span style="color:#1d9e75;font-weight:600">Γ£ô Completed</span>';
  } else {
    html += '<strong>' + st.title + '</strong><p style="margin-top:6px;white-space:pre-line">' + st.text + '</p>';
  }
  html += '</div></div></div>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">';
  if (!done) {
    html += '<button class="btn btn-success" onclick="completeLessonStep(' + idx + ')"><i class="ti ti-check"></i> Mark as complete</button>';
  }
  if (idx > 0) {
    html += '<button class="btn btn-ghost" onclick="prevLessonStep()"><i class="ti ti-arrow-left"></i> Previous</button>';
  }
  html += '</div>';

  document.getElementById('lessonBody').innerHTML = html;
  document.getElementById('lessonNextBtn').style.display = idx < steps.length - 1 ? 'inline-flex' : 'none';

  var closeBtn = document.querySelector('#lessonActions .btn-ghost');
  if (closeBtn) closeBtn.textContent = 'Close';
}

function completeLessonStep(idx) {
  if (!activeLesson) return;
  var p = getProgress();
  if (!p.modules) p.modules = {};
  if (!p.modules[activeLesson]) p.modules[activeLesson] = { steps: [] };
  if (!p.modules[activeLesson].steps) p.modules[activeLesson].steps = [];
  p.modules[activeLesson].steps[idx] = true;
  p.modules[activeLesson]._updated = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  addActivity('≡ƒôû Completed: ' + lessons[activeLesson].steps[idx].title + ' (' + lessons[activeLesson].title + ')');
  checkAchievements();
  showLessonStep();
  updateAllDisplays();
}

function nextLessonStep() {
  if (activeLesson && lessonStepIdx < lessons[activeLesson].steps.length - 1) {
    lessonStepIdx++;
    showLessonStep();
  }
}

function prevLessonStep() {
  if (lessonStepIdx > 0) {
    lessonStepIdx--;
    showLessonStep();
  }
}

// ====== QUIZ ======
var activeQuiz = null;
var quizQuestionIdx = 0;
var quizAnswers = [];

function startQuiz(id) {
  activeQuiz = id;
  quizQuestionIdx = 0;
  quizAnswers = [];
  document.getElementById('quizTitle').textContent = lessons[id].title + ' Quiz';
  document.getElementById('quizResult').style.display = 'none';
  document.getElementById('quizNextBtn').style.display = 'inline-flex';
  document.getElementById('quizNextBtn').disabled = true;
  document.getElementById('quizNextBtn').textContent = 'Next ΓåÆ';
  showQuizQuestion();
  document.getElementById('quizOverlay').classList.add('open');
}

function showQuizQuestion() {
  var qs = quizData[activeQuiz];
  var idx = quizQuestionIdx;
  var q = qs[idx];
  document.getElementById('quizProgress').textContent = 'Question ' + (idx + 1) + ' of ' + qs.length;
  document.getElementById('quizQuestion').textContent = q.q;
  var answered = quizAnswers[idx] !== undefined;
  var html = q.options.map(function(o, i) {
    var cls = 'quiz-option';
    if (answered) {
      if (i === q.answer) cls += ' correct';
      else if (i === quizAnswers[idx]) cls += ' wrong';
    } else if (i === quizAnswers[idx]) {
      cls += ' selected';
    }
    return '<button class="' + cls + '" onclick="answerQuiz(' + i + ')"' + (answered ? ' disabled' : '') + '>' + o + '</button>';
  }).join('');
  document.getElementById('quizOptions').innerHTML = html;
  document.getElementById('quizNextBtn').disabled = quizAnswers[idx] === undefined;
}

function answerQuiz(idx) {
  if (activeQuiz === null) return;
  quizAnswers[quizQuestionIdx] = idx;
  showQuizQuestion();
}

function nextQuizQuestion() {
  if (activeQuiz === null) return;
  var qs = quizData[activeQuiz];
  if (quizQuestionIdx < qs.length - 1) {
    quizQuestionIdx++;
    document.getElementById('quizNextBtn').disabled = true;
    showQuizQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  var qs = quizData[activeQuiz];
  var correct = 0;
  qs.forEach(function(q, i) {
    if (quizAnswers[i] === q.answer) correct++;
  });
  var total = qs.length;
  var pct = Math.round(correct / total * 100);
  var passed = pct >= 80;
  document.getElementById('quizScoreDisplay').textContent = correct + '/' + total;
  document.getElementById('quizScoreDisplay').style.color = passed ? '#1d9e75' : pct >= 50 ? '#ef9f27' : '#e24b4a';
  document.getElementById('quizResultLabel').textContent = passed ? 'Γ£à Passed! Mahusay!' : pct >= 50 ? 'Kailangan pang mag-aral. Try again!' : 'Need more practice. I-review ang module at subukan ulit.';
  document.getElementById('quizResult').style.display = 'block';
  document.getElementById('quizNextBtn').style.display = 'none';

  var p = getProgress();
  if (!p.quizzes) p.quizzes = {};
  if (!p.quizzes[activeQuiz] || p.quizzes[activeQuiz].correct < correct) {
    p.quizzes[activeQuiz] = { correct: correct, total: total };
    p._updated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    addActivity('≡ƒô¥ Quiz "' + lessons[activeQuiz].title + '": ' + correct + '/' + total + ' (' + pct + '%)' + (passed ? ' Γ£à PASSED' : ''));
    checkAchievements();
    updateAllDisplays();
  }
}

function retakeQuiz() {
  if (activeQuiz) startQuiz(activeQuiz);
}

// ====== SCENARIO ======
var activeScenarioKey = null;
var scenarioStepIdx = 0;

function startScenario(k) {
  activeScenarioKey = k;
  scenarioStepIdx = 0;
  var s = scenarioData[k];
  document.getElementById('scenarioTitle').textContent = s.title;
  showScenarioStep();
  document.getElementById('scenarioOverlay').classList.add('open');
}

function showScenarioStep() {
  var k = activeScenarioKey;
  if (!k) return;
  var s = scenarioData[k];
  var steps = s.steps;
  var idx = scenarioStepIdx;
  var p = getProgress();
  var done = p.scenarios && p.scenarios[k] && p.scenarios[k].completed;

  var html = '<div style="margin-bottom:12px;font-size:13px;color:#6b7a8d">' + s.desc + '</div>' +
    steps.map(function(st, i) {
      var isDone = done || (p.scenarios && p.scenarios[k] && p.scenarios[k].steps && p.scenarios[k].steps[i]);
      return '<div class="scenario-step ' + (isDone ? 'completed' : '') + '" id="ss-' + i + '"><div class="scenario-step-content"><div><span class="scenario-step-num">' + (i + 1) + '</span></div><div class="scenario-step-text">' +
        (isDone ? '<span style="color:#1d9e75;font-weight:600">Γ£ô Completed</span>' : '<strong>Step ' + (i + 1) + ':</strong><p style="margin-top:4px;white-space:pre-line">' + st.text + '</p>' + (i <= idx ? '<button class="btn btn-success btn-sm" style="margin-top:8px" onclick="completeScenarioStep(' + i + ')"><i class="ti ti-check"></i> Mark done</button>' : '')) +
        '</div></div></div>';
    }).join('');

  document.getElementById('scenarioBody').innerHTML = html;
  if (done) {
    document.getElementById('scenarioNextBtn').style.display = 'none';
  } else {
    document.getElementById('scenarioNextBtn').textContent = idx < steps.length - 1 ? 'Next Step ΓåÆ' : 'Complete Scenario';
    document.getElementById('scenarioNextBtn').style.display = 'inline-flex';
  }
}

function completeScenarioStep(idx) {
  if (!activeScenarioKey) return;
  var p = getProgress();
  if (!p.scenarios) p.scenarios = {};
  if (!p.scenarios[activeScenarioKey]) p.scenarios[activeScenarioKey] = { steps: [] };
  if (!p.scenarios[activeScenarioKey].steps) p.scenarios[activeScenarioKey].steps = [];
  p.scenarios[activeScenarioKey].steps[idx] = true;
  p._updated = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  addActivity('≡ƒöº Completed scenario step: ' + scenarioData[activeScenarioKey].steps[idx].text.substring(0, 50) + 'ΓÇª');
  checkAchievements();
  showScenarioStep();
  updateAllDisplays();
}

function nextScenarioStep() {
  if (!activeScenarioKey) return;
  var steps = scenarioData[activeScenarioKey].steps;
  if (scenarioStepIdx < steps.length - 1) {
    scenarioStepIdx++;
    showScenarioStep();
  } else {
    // Complete
    var p = getProgress();
    if (!p.scenarios) p.scenarios = {};
    if (!p.scenarios[activeScenarioKey]) p.scenarios[activeScenarioKey] = {};
    p.scenarios[activeScenarioKey].completed = true;
    p._updated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    addActivity('Γ£à Scenario completed: ' + scenarioData[activeScenarioKey].title);
    checkAchievements();
    showScenarioStep();
    updateAllDisplays();
  }
}

// ====== MODAL ======
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  if (id === 'lessonOverlay') { activeLesson = null; }
  if (id === 'quizOverlay') { activeQuiz = null; }
  if (id === 'scenarioOverlay') { activeScenarioKey = null; }
}

// ====== LOGIN ======
// ====== INIT ======
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('appMain').style.display = 'flex';
  updateAllDisplays();
});
