// Bot conversation messages in all supported languages.
// Commands stay language-neutral (numbers / short English) so they always work.

export type BotLang = "en" | "te" | "ta" | "hi";

type BotStrings = {
  greeting: (name: string) => string;
  notRegistered: string;
  askCustomerName: string;
  askCustomerPhone: string;
  askAddress: string;
  askItems: string;
  itemsParseError: string;
  confirm: (summary: string, total: string) => string;
  created: (invNo: string, total: string, link: string) => string;
  paidOk: (invNo: string) => string;
  paidNotFound: (invNo: string) => string;
  cancelled: string;
  help: string;
};

const en: BotStrings = {
  greeting: (name) =>
    `Hi ${name}! 👋 I am your GetWeChaat assistant.\n\nSend *1* to create a new invoice.\nSend *paid INV-...* to mark an invoice paid.`,
  notRegistered:
    "This number is not registered with GetWeChaat. Sign up first: https://getwechaat-web.vercel.app/login",
  askCustomerName: "New invoice 🧾\n\nCustomer name?",
  askCustomerPhone: "Customer WhatsApp number?",
  askAddress: "Delivery address? (send *skip* if none)",
  askItems:
    "Items — one per line:\nname, qty, price\n\nExample:\n1gm Gold Stud, 1, 2850\nChain, 2, 1500",
  itemsParseError:
    "I could not read that. Send items one per line like:\n1gm Gold Stud, 1, 2850",
  confirm: (summary, total) =>
    `Please check:\n\n${summary}\n*Total: ${total}*\n\nSend *yes* to create, *cancel* to discard.`,
  created: (invNo, total, link) =>
    `✅ Invoice *${invNo}* created — ${total}\n\nSend this link to your customer (QR + payment inside):\n${link}\n\nWhen money arrives, send:\n*paid ${invNo}*`,
  paidOk: (invNo) => `✅ ${invNo} marked as PAID. The invoice now shows the paid stamp.`,
  paidNotFound: (invNo) => `Could not find an unpaid invoice ${invNo}. Check the number.`,
  cancelled: "Cancelled. Send *1* whenever you need a new invoice.",
  help: "Send *1* for a new invoice, or *paid INV-...* to mark one paid.",
};

const te: BotStrings = {
  greeting: (name) =>
    `హాయ్ ${name}! 👋 నేను మీ GetWeChaat అసిస్టెంట్.\n\nకొత్త ఇన్వాయిస్ కోసం *1* పంపండి.\nఇన్వాయిస్ చెల్లించారని గుర్తించడానికి *paid INV-...* పంపండి.`,
  notRegistered:
    "ఈ నంబర్ GetWeChaatలో నమోదు కాలేదు. ముందుగా సైన్ అప్ చేయండి: https://getwechaat-web.vercel.app/login",
  askCustomerName: "కొత్త ఇన్వాయిస్ 🧾\n\nకస్టమర్ పేరు?",
  askCustomerPhone: "కస్టమర్ వాట్సాప్ నంబర్?",
  askAddress: "డెలివరీ చిరునామా? (లేకపోతే *skip* పంపండి)",
  askItems:
    "వస్తువులు — ఒక్కో లైన్‌లో ఒకటి:\nపేరు, సంఖ్య, ధర\n\nఉదాహరణ:\n1gm గోల్డ్ స్టడ్, 1, 2850\nచైన్, 2, 1500",
  itemsParseError:
    "అర్థం కాలేదు. ఇలా పంపండి (ఒక్కో లైన్‌లో ఒక వస్తువు):\n1gm గోల్డ్ స్టడ్, 1, 2850",
  confirm: (summary, total) =>
    `దయచేసి చూడండి:\n\n${summary}\n*మొత్తం: ${total}*\n\nసృష్టించడానికి *yes*, రద్దుకి *cancel* పంపండి.`,
  created: (invNo, total, link) =>
    `✅ ఇన్వాయిస్ *${invNo}* సృష్టించబడింది — ${total}\n\nఈ లింక్ కస్టమర్‌కి పంపండి (QR + చెల్లింపు లోపల ఉంది):\n${link}\n\nడబ్బు వచ్చాక ఇలా పంపండి:\n*paid ${invNo}*`,
  paidOk: (invNo) => `✅ ${invNo} చెల్లించినట్టు గుర్తించబడింది. ఇన్వాయిస్‌పై స్టాంప్ కనిపిస్తుంది.`,
  paidNotFound: (invNo) => `చెల్లించని ఇన్వాయిస్ ${invNo} కనబడలేదు. నంబర్ చూడండి.`,
  cancelled: "రద్దు చేయబడింది. కొత్త ఇన్వాయిస్ కావాలంటే *1* పంపండి.",
  help: "కొత్త ఇన్వాయిస్ కోసం *1*, చెల్లించారని గుర్తించడానికి *paid INV-...* పంపండి.",
};

const ta: BotStrings = {
  greeting: (name) =>
    `வணக்கம் ${name}! 👋 நான் உங்கள் GetWeChaat உதவியாளர்.\n\nபுதிய விலைப்பட்டியலுக்கு *1* அனுப்பவும்.\nசெலுத்தியதாகக் குறிக்க *paid INV-...* அனுப்பவும்.`,
  notRegistered:
    "இந்த எண் GetWeChaat-இல் பதிவு செய்யப்படவில்லை. முதலில் பதிவு செய்யவும்: https://getwechaat-web.vercel.app/login",
  askCustomerName: "புதிய விலைப்பட்டியல் 🧾\n\nவாடிக்கையாளர் பெயர்?",
  askCustomerPhone: "வாடிக்கையாளர் வாட்ஸ்அப் எண்?",
  askAddress: "டெலிவரி முகவரி? (இல்லை என்றால் *skip* அனுப்பவும்)",
  askItems:
    "பொருட்கள் — ஒரு வரிக்கு ஒன்று:\nபெயர், எண்ணிக்கை, விலை\n\nஎடுத்துக்காட்டு:\n1gm தங்க தோடு, 1, 2850\nசங்கிலி, 2, 1500",
  itemsParseError:
    "புரியவில்லை. இப்படி அனுப்பவும் (ஒரு வரிக்கு ஒரு பொருள்):\n1gm தங்க தோடு, 1, 2850",
  confirm: (summary, total) =>
    `சரிபார்க்கவும்:\n\n${summary}\n*மொத்தம்: ${total}*\n\nஉருவாக்க *yes*, ரத்து செய்ய *cancel* அனுப்பவும்.`,
  created: (invNo, total, link) =>
    `✅ விலைப்பட்டியல் *${invNo}* உருவாக்கப்பட்டது — ${total}\n\nஇந்த இணைப்பை வாடிக்கையாளருக்கு அனுப்பவும் (QR + பணம் செலுத்துதல் உள்ளே):\n${link}\n\nபணம் வந்ததும் அனுப்பவும்:\n*paid ${invNo}*`,
  paidOk: (invNo) => `✅ ${invNo} செலுத்தப்பட்டதாகக் குறிக்கப்பட்டது. முத்திரை காட்டப்படும்.`,
  paidNotFound: (invNo) => `செலுத்தப்படாத விலைப்பட்டியல் ${invNo} கிடைக்கவில்லை. எண்ணைச் சரிபார்க்கவும்.`,
  cancelled: "ரத்து செய்யப்பட்டது. புதிய விலைப்பட்டியலுக்கு *1* அனுப்பவும்.",
  help: "புதிய விலைப்பட்டியலுக்கு *1*, செலுத்தியதாகக் குறிக்க *paid INV-...* அனுப்பவும்.",
};

const hi: BotStrings = {
  greeting: (name) =>
    `नमस्ते ${name}! 👋 मैं आपका GetWeChaat असिस्टेंट हूं।\n\nनया इनवॉइस बनाने के लिए *1* भेजें।\nभुगतान चिह्नित करने के लिए *paid INV-...* भेजें।`,
  notRegistered:
    "यह नंबर GetWeChaat में पंजीकृत नहीं है। पहले साइन अप करें: https://getwechaat-web.vercel.app/login",
  askCustomerName: "नया इनवॉइस 🧾\n\nग्राहक का नाम?",
  askCustomerPhone: "ग्राहक का व्हाट्सएप नंबर?",
  askAddress: "डिलीवरी पता? (नहीं है तो *skip* भेजें)",
  askItems:
    "सामान — हर लाइन में एक:\nनाम, मात्रा, कीमत\n\nउदाहरण:\n1gm गोल्ड स्टड, 1, 2850\nचेन, 2, 1500",
  itemsParseError:
    "समझ नहीं आया। ऐसे भेजें (हर लाइन में एक वस्तु):\n1gm गोल्ड स्टड, 1, 2850",
  confirm: (summary, total) =>
    `कृपया जांचें:\n\n${summary}\n*कुल: ${total}*\n\nबनाने के लिए *yes*, रद्द के लिए *cancel* भेजें।`,
  created: (invNo, total, link) =>
    `✅ इनवॉइस *${invNo}* बन गया — ${total}\n\nयह लिंक ग्राहक को भेजें (QR + भुगतान अंदर है):\n${link}\n\nपैसा आने पर भेजें:\n*paid ${invNo}*`,
  paidOk: (invNo) => `✅ ${invNo} भुगतान हुआ चिह्नित। इनवॉइस पर स्टांप दिखेगा।`,
  paidNotFound: (invNo) => `बिना भुगतान वाला इनवॉइस ${invNo} नहीं मिला। नंबर जांचें।`,
  cancelled: "रद्द किया गया। नए इनवॉइस के लिए *1* भेजें।",
  help: "नए इनवॉइस के लिए *1*, भुगतान चिह्नित करने के लिए *paid INV-...* भेजें।",
};

const dict: Record<BotLang, BotStrings> = { en, te, ta, hi };

export function botStrings(lang: string | null | undefined): BotStrings {
  return dict[(lang as BotLang) || "en"] || en;
}
