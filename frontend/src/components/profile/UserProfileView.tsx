"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleKey, ROLES } from "@/lib/roles";
import { getStoredSession, AuthSession } from "@/lib/auth";
import ZaminFlowLogo from "@/components/ZaminFlowLogo";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme, ThemeToggleButton } from "@/context/ThemeContext";
import { getDisplayInitials, resolveUserAvatar } from "@/lib/userAvatar";

export interface UserProfileData {
  userId: string;
  role: RoleKey;
  fullName: string;
  title: string;
  organizationName: string;
  location: string;
  avatarUrl: string;
  bannerUrl?: string;
  email: string;
  phone: string;
  trustScore: number;
  kybVerified: boolean;
  memberSince: string;
  taxId: string;
  bankName: string;
  iban: string;
  bio: string;
  languages: string[];
  capabilities: { label: string; count?: string; active?: boolean }[];
  stats: {
    label: string;
    value: string;
    sublabel: string;
  }[];
  team: {
    name: string;
    role: string;
    avatarUrl: string;
    phone?: string;
    email?: string;
  }[];
  tradingSpecs: {
    label: string;
    value: string;
  }[];
  roleSpecifics: {
    sectionTitle: string;
    items: { label: string; value: string; badge?: string }[];
  };
}

interface UserProfileViewProps {
  initialRole?: RoleKey;
  profileId?: string;
}

export default function UserProfileView({
  initialRole = "farmer",
  profileId,
}: UserProfileViewProps) {
  const router = useRouter();
  const { locale, setLocale, t } = useLanguage();
  const { themeMode, isDark } = useTheme();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "contracts" | "team">("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [failedTeamImages, setFailedTeamImages] = useState<Record<number, boolean>>({});

  const role: RoleKey = initialRole;

  const farmerFullName = "İminjonov Muhammadaziz";
  const dairyFullName = "Malika Karimova";
  const driverFullName = "Bobur Alimov";
  const bankFullName = "Rustam Karimov";
  const adminFullName = "İminjonov Muhammadaziz";

  // Role-customized high-end profiles
  const roleProfiles: Record<RoleKey, UserProfileData> = {
    farmer: {
      userId: "usr-farmer-01",
      role: "farmer",
      fullName: farmerFullName,
      title: "Boş Fermer & Xom Sut Işlab Çiqaruvçi",
      organizationName: session?.organization?.legalName || "Çorva Baraka Fermer Xöjaligi",
      location: "Toşkent viloyati, Özbekiston",
      avatarUrl: resolveUserAvatar(farmerFullName, session?.user?.email || "farmer@zaminflow.uz") || "",
      email: session?.user?.email || "farmer@zaminflow.uz",
      phone: session?.user?.phoneNumber || "+998 90 123 45 67",
      trustScore: 98,
      kybVerified: true,
      memberSince: "Mart 2025",
      taxId: `STIR: ${session?.organization?.taxId || "308 112 940"}`,
      bankName: "AgroBank Boş Ofisi",
      iban: "UZ8800010000304981223001",
      bio: "Zamonaviy agrosanoat fermasi. GEA avtomatlaştirilgan sovitiş tanklari (+3.2°C) va raqamli titratsiya laboratoriyasi bilan töliq jihozlangan.",
      languages: ["Özbekça", "Русский", "Engliş"],
      capabilities: [
        { label: "Kunlik Hajm: 4,500 L / kun", active: true },
        { label: "Yoğlik Körsatkiçi: 3.9% – 4.2%", active: true },
        { label: "SNF (Quruq Qoldiq): 8.65% Sertifikatlangan", active: true },
        { label: "Oldindan Sovitiş: +3.2°C Qulflangan", active: true },
        { label: "Veterinariya Guvohnomasi № UZ-99412", active: true },
        { label: "AgroBank Kafolatlangan Eskrou", active: true },
      ],
      stats: [
        { label: "Bajarilgan Yetkazib Berişlar", value: "142 ta", sublabel: "100% muvaffaqiyatli" },
        { label: "Sifat Sertifikatsiyasi", value: "98.4%", sublabel: "Oliy A+ navli sut" },
        { label: "Nizo va Jarimalar", value: "0.0%", sublabel: "Toza kredit tarixi" },
        { label: "Hisob-kitob Tezligi", value: "< 2.5 soat", sublabel: "AgroBank avto-kliring" },
      ],
      team: [
        { name: "İminjonov Muhammadaziz", role: "Muassis & Boş Fermer", avatarUrl: "/images/team-muhammadaziz.webp", phone: "+998 90 333 44 55", email: "farmer@zaminflow.uz" },
        { name: "Akrom Abdumanov", role: "IoT Datçiklar & Texnik Muhandis", avatarUrl: "/images/team-akrom.webp", phone: "+998 91 123 45 67", email: "akrom@zaminflow.uz" },
        { name: "Sevinçoy Soporboyeva", role: "Boş Zootexnik & Sifat Nazoratçisi", avatarUrl: "/images/team-sevinchoy.webp", phone: "+998 93 987 65 43", email: "sevinchoy@zaminflow.uz" },
      ],
      tradingSpecs: [
        { label: "Minimal Buyurtma Miqdori", value: "1,000 Litr" },
        { label: "Maksimal Quvvat", value: "5,500 Litr / kun" },
        { label: "Harorat Kafolati", value: "+3.2°C dan +4.0°C gacha" },
        { label: "Bazaviy Xarid Narxi", value: "5,800 – 6,200 UZS / L" },
        { label: "Tölov Kafolati", value: "ZaminFlow Smart Contract & AgroBank Escrow" },
      ],
      roleSpecifics: {
        sectionTitle: "Fermer Xöjaligi Agro-Texnik Pasporti",
        items: [
          { label: "Mollar zoti", value: "Holstein-Friesian (Gollandiya)", badge: "Naslli" },
          { label: "Jami qoramol soni", value: "240 boş (180 soğin)" },
          { label: "Soğiş uskunasi", value: "GEA Westfalia 2x12 Paralell" },
          { label: "Sovitiş tanki siğimi", value: "6,000 Litr (Stainless 316)" },
          { label: "Veterinariya holati", value: "Töliq emlangan • Pasportlaştirilgan", badge: "№ VET-2026-88" },
        ],
      },
    },

    dairy: {
      userId: "usr-dairy-01",
      role: "dairy",
      fullName: dairyFullName,
      title: "Boş Texnolog & Xaridlar Departamenti Rahbari",
      organizationName: session?.organization?.legalName || "ZaminFlow Sutni Qayta Işlaş Zavodi",
      location: "Toşkent sanoat zonasi, Özbekiston",
      avatarUrl: resolveUserAvatar(dairyFullName, session?.user?.email || "dairy@zaminflow.uz") || "",
      email: session?.user?.email || "dairy@zaminflow.uz",
      phone: session?.user?.phoneNumber || "+998 71 200 45 67",
      trustScore: 99,
      kybVerified: true,
      memberSince: "Yanvar 2025",
      taxId: `STIR: ${session?.organization?.taxId || "201 445 990"}`,
      bankName: "AgroBank Boş Ofisi",
      iban: "UZ4500020000201445990001",
      bio: "Sutni çuqur qayta işlovçi zamonaviy sanoat korxonasi. Pasterizatsiyalangan içimlik suti, sariyoğ, kefir va pişloq işlab çiqariş liniyalari. Kiruvçi sut Agrobank depozitlarida oldindan 100% kafolatlangan eskrou mablağlari bilan tölanadi.",
      languages: ["Русский", "Özbekça", "Engliş"],
      capabilities: [
        { label: "Qabul Quvvati: 180,000 L / kun", active: true },
        { label: "Standart SNF: kamida 8.5%", active: true },
        { label: "ISO 22000 & Halol Xalqaro Standart", active: true },
        { label: "Oldindan Töldirilgan Eskrou Depoziti", active: true },
        { label: "Ekspress Laboratoriya: 15 daqiqa", active: true },
        { label: "24/7 Qabul Qiliş Bunkeri", active: true },
      ],
      stats: [
        { label: "Oylik Sut Qabuli", value: "4.8M Litr", sublabel: "Sanoat hajmidagi işlab çiqariş" },
        { label: "Faol Fermer Şartnomalari", value: "84 ta Ferma", sublabel: "Töğridan-töğri kooperativlar" },
        { label: "Örtaça Eskrou Kliringi", value: "1.8 soat", sublabel: "Testdan söng bank ötkazmasi" },
        { label: "Işonç Reytingi", value: "99 / 100", sublabel: "A toifadagi sanoat hamkori" },
      ],
      team: [
        { name: "Sevinçoy Soporboyeva", role: "Sifat va Qabul Nazorati Rahbari", avatarUrl: "/images/team-sevinchoy.webp", phone: "+998 71 200 45 68", email: "quality@zavod4.uz" },
        { name: "Şohjahon Abdufattohov", role: "Strategik Taʼminot va Iqtisodçi", avatarUrl: "/images/team-shohjahon.webp", phone: "+998 71 200 45 69", email: "procurement@zavod4.uz" },
        { name: "Akrom Abdumanov", role: "Zavod Avtomatizatsiyasi Muhandisi", avatarUrl: "/images/team-akrom.webp", phone: "+998 91 123 45 67", email: "automation@zavod4.uz" },
      ],
      tradingSpecs: [
        { label: "Talab Qilinuvçi Nav", value: "Oliy A+ yoki 1-navli xom sut" },
        { label: "Qabul Qiliş Vaqti", value: "24/7 Uzluksiz sovuq qabul" },
        { label: "Bozor Narxlari Indeksi", value: "5,800 – 6,400 UZS / L (Yoğlikka qarab)" },
        { label: "Laboratoriya Titratsiya Vaqti", value: "Har bir sisterna uçun 15 daqiqa" },
        { label: "Moliyaviy Kafolat", value: "Markaziy Bank & AgroBank Eskrou" },
      ],
      roleSpecifics: {
        sectionTitle: "Sanoat Qayta Işlaş Texnologik Quvvati",
        items: [
          { label: "Silo tanklar soni", value: "4 dona x 60,000L", badge: "240k L Jami" },
          { label: "Pasterizator quvvati", value: "15,000 Litr / soat (Tetra Pak)" },
          { label: "Homogenizator bosimi", value: "200 bar (Yuqori dispers)" },
          { label: "Sovuq saqlaş harorati", value: "2.8°C (Avtomatik çiller)" },
          { label: "Sertifikatlar", value: "ISO 22000:2018 & Halol Sertifikati", badge: "UZ-HALAL-99" },
        ],
      },
    },

    driver: {
      userId: "usr-driver-01",
      role: "driver",
      fullName: driverFullName,
      title: "Sertifikatlangan Sovuq Zanjir Tanker Haydovçisi",
      organizationName: "ZaminFlow Sovuq Zanjir Logistika Floti #04",
      location: "Toşkent - Sayxunobod - Samarqand logistika yölagi",
      avatarUrl: resolveUserAvatar(driverFullName, "driver@zaminflow.uz") || "",
      email: "driver@zaminflow.uz",
      phone: "+998 90 999 88 77",
      trustScore: 97,
      kybVerified: true,
      memberSince: "Aprel 2025",
      taxId: "STIR: 401 229 110",
      bankName: "AgroBank Transport Kliring Filiali",
      iban: "UZ1200030000401229110001",
      bio: "8 yillik tajribaga ega professional oziq-ovqat transporti haydovçisi. MAN TGX 18.440 20,000 litr siğimli oziq-ovqat zanglamas pölat sisternasini boşqaradi. ZaminFlow IoT harorat nazorat tizimi va GPS sun'iy yöldoş kuzatuvi bilan töliq jihozlangan.",
      languages: ["Özbekça", "Русский"],
      capabilities: [
        { label: "20,000 L Izolyatsiyalangan Sisterna", active: true },
        { label: "Real Vaqtda GPS Telemetriya", active: true },
        { label: "Sovuq Zanjir: 3.2°C Germetik", active: true },
        { label: "QR Elektron Yöl Varaqasi (e-TTN)", active: true },
        { label: "CIP Dezinfeksiya Sertifikatlangan", active: true },
      ],
      stats: [
        { label: "Bajarilgan Qatnovlar", value: "348 ta", sublabel: "Harorat buzilişlarsiz" },
        { label: "Örtaça Yuk Harorati", value: "+3.2°C", sublabel: "Kalibrlangan datçik" },
        { label: "Vaqtida Yetkaziş Uluşi", value: "99.1%", sublabel: "Jadvalga qatʼiy rioya" },
        { label: "Xavfsizlik Reytingi", value: "5.0 ★", sublabel: "Malakali haydovçi" },
      ],
      team: [
        { name: "Akrom Abdumanov", role: "Flot Telemetriyasi & IoT Dispetçer", avatarUrl: "/images/team-akrom.webp", phone: "+998 91 123 45 67", email: "fleet@zaminflow.uz" },
        { name: "Şohjahon Abdufattohov", role: "Logistika Yönalişlari Muvofiqlaştiruvçisi", avatarUrl: "/images/team-shohjahon.webp", phone: "+998 93 555 44 33", email: "routes@zaminflow.uz" },
      ],
      tradingSpecs: [
        { label: "Transport Rusumi", value: "MAN TGX 18.440 Euro 6" },
        { label: "Davlat Raqami", value: "01 | 777 ZAM" },
        { label: "Sanitariya Pasporti", value: "Davlat Sanitariya № SAN-2026-90" },
        { label: "Xizmat Körsatiş Yönalişlari", value: "Toşkent, Sirdaryo, Samarqand, Jizzax" },
      ],
      roleSpecifics: {
        sectionTitle: "Logistika Texnik & Sovuq Zanjir Pasporti",
        items: [
          { label: "Sisterna materiali", value: "AISI 304 Oziq-ovqat zanglamas pölat", badge: "Termo-izolyatsiya" },
          { label: "Bölimlar soni", value: "3 ta alohida seksiya (8k + 6k + 6k L)" },
          { label: "Nasos unumdorligi", value: "30,000 L / soat (Elektr avtonom)" },
          { label: "Harorat datçiklari", value: "4 ta PT100 zond (Har bir bölimda)" },
          { label: "GPS aniqligi", value: "RTK 0.5 metr aniqlik & GSM 5G", badge: "Online" },
        ],
      },
    },

    bank: {
      userId: "usr-bank-01",
      role: "bank",
      fullName: bankFullName,
      title: "Boş Eskrou & Kliring Nazoratçisi",
      organizationName: "Agrobank ATB (Eskrou Depozitariysi)",
      location: "Muqimiy köçasi 43, Toşkent, 100096, Özbekiston",
      avatarUrl: resolveUserAvatar(bankFullName, "bank@zaminflow.uz") || "",
      email: "bank@zaminflow.uz",
      phone: "+998 71 203 88 88",
      trustScore: 100,
      kybVerified: true,
      memberSince: "Fevral 2025",
      taxId: "STIR: 200 110 994",
      bankName: "Özbekiston Respublikasi Markaziy Banki Kliring Tizimi",
      iban: "UZ0100400000200110994001",
      bio: "Agrobank ATB — ZaminFlow platformasidagi B2B qişloq xöjaligi savdo şartnomalari böyiça rasmiy litsenziyalangan eskrou depozitariysi va moliyaviy kliring hamkori. ISO 20022 pacs.008 real vaqt rejimida hisob-kitoblar, ikki yoqlama buxgalteriya va qonuniy tölov kafolatlarini taʼminlaydi.",
      languages: ["Özbekça", "Русский", "Engliş"],
      capabilities: [
        { label: "ISO 20022 pacs.008 Kliring Mexanizmi", active: true },
        { label: "Eskrou Depozitariy Xavfsizlik Kafolati", active: true },
        { label: "ŞA-256 Kriptografik Audit Zanjiri", active: true },
        { label: "Markaziy Bank Bank Litsenziyasi №14", active: true },
        { label: "Ikki Yoqlama Buxgalteriya Reestri", active: true },
      ],
      stats: [
        { label: "Eskrou Tölov Qobiliyati", value: "100%", sublabel: "Töliq garov taʼminlangan" },
        { label: "Kliring Vaqti", value: "< 3 daqiqa", sublabel: "Laboratoriya tasdiğidan söng" },
        { label: "Muvaffaqiyatsiz Tölovlar", value: "0.00%", sublabel: "Nol muddati ötgan qarz" },
        { label: "Audit Yaxlitligi", value: "Tasdiqlangan", sublabel: "Markaziy Bank reyestri" },
      ],
      team: [
        { name: "İminjonov Muhammadaziz", role: "Muassis & Eskrou Boşqaruvi", avatarUrl: "/images/team-muhammadaziz.webp", phone: "+998 71 203 88 88", email: "escrow@agrobank.uz" },
        { name: "Şohjahon Abdufattohov", role: "Moliyaviy Muvofiqlik Maslahatçisi", avatarUrl: "/images/team-shohjahon.webp", phone: "+998 71 203 88 89", email: "compliance@agrobank.uz" },
      ],
      tradingSpecs: [
        { label: "Markaziy Bank Litsenziyasi", value: "MB Boş Litsenziyasi № 14" },
        { label: "Kliring Xalqaro Standarti", value: "ISO 20022 (pacs.008.001.08)" },
        { label: "Hisobvaraq Turi", value: "Maxsus Eskrou & Tranzit Hisobvaraq" },
      ],
      roleSpecifics: {
        sectionTitle: "Bank Depozitariysi & Fintex Muvofiqlik Körsatkiçlari",
        items: [
          { label: "Eskrou saqlaş hajmi", value: "142.85 Mln UZS", badge: "Kafolatlangan" },
          { label: "Şifrlaş standarti", value: "RSA-4096 / ŞA-256 (ÖzDSt)" },
          { label: "Tölov şlyuzi", value: "MUNIS & Anor Tölov Tizimlari" },
          { label: "Regulyativ nazorat", value: "Özbekiston Respublikasi Markaziy Banki", badge: "CBU Audit" },
        ],
      },
    },

    admin: {
      userId: "usr-admin-01",
      role: "admin",
      fullName: adminFullName,
      title: "Muassis & Boş Tizim Regulyatori",
      organizationName: "ZaminFlow Milliy Raqamli Ekotizim Burosi",
      location: "Navoiy şoh köçasi 14, Toşkent, 100011, Özbekiston",
      avatarUrl:
        resolveUserAvatar(adminFullName, "admin@zaminflow.uz") || "/images/team-muhammadaziz.webp",
      email: "admin@zaminflow.uz",
      phone: "+998 71 200 45 67",
      trustScore: 100,
      kybVerified: true,
      memberSince: "Yanvar 2025",
      taxId: "STIR: 100 000 001",
      bankName: "Özbekiston Respublikasi Markaziy Banki",
      iban: "UZ0000000000000000000001",
      bio: "ZaminFlow milliy B2B sut taʼminoti zanjiri va fintex ekotizimi boş koordinatori va boşqaruvçisi. Iştirokçilarning KYB dosyelarini tekşiriş, laboratoriya arbitraji nizolarini hal qiliş va Özbekiston böyiça yagona xom sut standarti integratsiyasini nazorat qiladi.",
      languages: ["Özbekça", "Русский", "Engliş"],
      capabilities: [
        { label: "Markaziy Bank Eskrou Nazorati", active: true },
        { label: "Nizolar Arbitraji Tribunali", active: true },
        { label: "Korxonalarni KYB Tekşiruvi", active: true },
        { label: "Milliy Standartlar (GOST 31449)", active: true },
        { label: "Soliq.uz STIR Integratsiyasi", active: true },
      ],
      stats: [
        { label: "Faol Korxonalar", value: "1,714 ta", sublabel: "Verifikatsiyalangan akkauntlar" },
        { label: "Eskrou Depozitariysi", value: "284.5M UZS", sublabel: "Platforma aylanmasi" },
        { label: "Nizolarni Hal Qiliş", value: "< 24 soat", sublabel: "Tribunal SLA" },
        { label: "Xavfsizlik Standarti", value: "100%", sublabel: "Qatʼiy qonuniy audit" },
      ],
      team: [
        { name: "İminjonov Muhammadaziz", role: "Muassis & Super Admin", avatarUrl: "/images/team-muhammadaziz.webp", phone: "+998 71 200 45 67", email: "admin@zaminflow.uz" },
        { name: "Sevinçoy Soporboyeva", role: "Hammuassis & Operatsiyalar Rahbari", avatarUrl: "/images/team-sevinchoy.webp", phone: "+998 71 200 45 70", email: "operations@zaminflow.uz" },
        { name: "Akrom Abdumanov", role: "Boş Platforma Arxitektori", avatarUrl: "/images/team-akrom.webp", phone: "+998 71 200 45 71", email: "arch@zaminflow.uz" },
        { name: "Şohjahon Abdufattohov", role: "Strategik Maslahatçi", avatarUrl: "/images/team-shohjahon.webp", phone: "+998 71 200 45 72", email: "strategy@zaminflow.uz" },
      ],
      tradingSpecs: [
        { label: "Yurisdiksiya", value: "Özbekiston Respublikasi (14 ta hudud)" },
        { label: "Qonunçilik Asosi", value: "Elektron Tijorat va Fintex Eskrou Qonuni" },
      ],
      roleSpecifics: {
        sectionTitle: "Ekotizim Boşqaruvi & Nazorat Ruxsatnomalari",
        items: [
          { label: "Tizim huquqi", value: "Root Super Administrator", badge: "Maxsus" },
          { label: "Audit kaliti", value: "ŞA-256 Master Key #UZ-SEC-412" },
          { label: "Soliq.uz STIR gateway", value: "Direct Gov API • 14ms latency", badge: "Online" },
          { label: "Arbitraj vakolati", value: "Titratsiya xulosalari asosida avto-kliring" },
        ],
      },
    },
  };

  // State initialization with local persistence
  const [profileState, setProfileState] = useState<UserProfileData>(() => {
    return roleProfiles[role] || roleProfiles.farmer;
  });

  // Modal edit fields
  const [editFullName, setEditFullName] = useState(profileState.fullName);
  const [editTitle, setEditTitle] = useState(profileState.title);
  const [editOrgName, setEditOrgName] = useState(profileState.organizationName);
  const [editLocation, setEditLocation] = useState(profileState.location);
  const [editBio, setEditBio] = useState(profileState.bio);
  const [editPhone, setEditPhone] = useState(profileState.phone);
  const [editEmail, setEditEmail] = useState(profileState.email);
  const [editBankName, setEditBankName] = useState(profileState.bankName);
  const [editIban, setEditIban] = useState(profileState.iban);

  // New Team Member Form fields
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");

  useEffect(() => {
    const sess = getStoredSession();
    setSession(sess);

    // Load custom profile edits from localStorage if available
    try {
      const saved = localStorage.getItem(`zaminflow_custom_profile_${role}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfileState((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
      const bookmarked = localStorage.getItem(`zaminflow_bookmarked_${profileState.userId}`);
      if (bookmarked === "true") {
        setIsBookmarked(true);
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [role, profileState.userId]);

  // Sync edit form with current state when modal opens
  const openEditModal = () => {
    setEditFullName(profileState.fullName);
    setEditTitle(profileState.title);
    setEditOrgName(profileState.organizationName);
    setEditLocation(profileState.location);
    setEditBio(profileState.bio);
    setEditPhone(profileState.phone);
    setEditEmail(profileState.email);
    setEditBankName(profileState.bankName);
    setEditIban(profileState.iban);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfileData = {
      ...profileState,
      fullName: editFullName.trim() || profileState.fullName,
      title: editTitle.trim() || profileState.title,
      organizationName: editOrgName.trim() || profileState.organizationName,
      location: editLocation.trim() || profileState.location,
      bio: editBio.trim() || profileState.bio,
      phone: editPhone.trim() || profileState.phone,
      email: editEmail.trim() || profileState.email,
      bankName: editBankName.trim() || profileState.bankName,
      iban: editIban.trim() || profileState.iban,
    };

    setProfileState(updated);
    try {
      localStorage.setItem(`zaminflow_custom_profile_${role}`, JSON.stringify(updated));
    } catch {
      // safe fallback
    }

    setIsEditModalOpen(false);
    showToast(
      locale === "ru"
        ? "✓ Данные профиля успешно обновлены и сохранены."
        : locale === "en"
        ? "✓ Profile data successfully updated and saved."
        : "✓ Profil maʼlumotlari muvaffaqiyatli yangilandi va saqlandi."
    );
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim()) return;

    const newMember = {
      name: newMemberName.trim(),
      role: newMemberRole.trim(),
      avatarUrl: "",
      phone: newMemberPhone.trim() || profileState.phone,
      email: newMemberEmail.trim() || profileState.email,
    };

    const updated = {
      ...profileState,
      team: [...profileState.team, newMember],
    };

    setProfileState(updated);
    try {
      localStorage.setItem(`zaminflow_custom_profile_${role}`, JSON.stringify(updated));
    } catch {
      // safe fallback
    }

    setNewMemberName("");
    setNewMemberRole("");
    setNewMemberPhone("");
    setNewMemberEmail("");
    setIsAddTeamModalOpen(false);
    showToast(
      locale === "ru"
        ? `✓ Новый ответственный сотрудник (${newMember.name}) добавлен в список.`
        : locale === "en"
        ? `✓ New team member (${newMember.name}) added to list.`
        : `✓ Yangi mas'ul xodim (${newMember.name}) ro'yxatga qo'shildi.`
    );
  };

  const handleToggleBookmark = () => {
    const nextVal = !isBookmarked;
    setIsBookmarked(nextVal);
    try {
      localStorage.setItem(`zaminflow_bookmarked_${profileState.userId}`, String(nextVal));
    } catch {
      // safe fallback
    }
    showToast(
      nextVal
        ? locale === "ru"
          ? "★ Досье добавлено в избранное!"
          : locale === "en"
          ? "★ Dossier added to bookmarks!"
          : "★ Dossier tanlanganlar roʻyxatiga qoʻshildi!"
        : locale === "ru"
        ? "☆ Досье удалено из избранного."
        : locale === "en"
        ? "☆ Dossier removed from bookmarks."
        : "☆ Dossier tanlanganlardan olib tashlandi."
    );
  };

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      const msg =
        locale === "ru"
          ? "✓ Ссылка на профиль скопирована в буфер обмена!"
          : locale === "en"
          ? "✓ Profile link copied to clipboard!"
          : "✓ Profil havolasi buferga nusxalandi! Hamkorlarga yuborishingiz mumkin.";
      showToast(msg);
    }
  };

  const handleExportDossier = () => {
    const exportData = {
      platform: "ZaminFlow B2B National Agro-Fintech",
      exportTimestamp: new Date().toISOString(),
      dossierVersion: "2.4.0",
      cryptographicHash: `SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}-UZ`,
      profile: profileState,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ZaminFlow_Dossier_${profileState.userId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const msg =
      locale === "ru"
        ? "✓ Официальный цифровой паспорт (JSON) успешно скачан."
        : locale === "en"
        ? "✓ Official digital passport (JSON) successfully downloaded."
        : "✓ Rasmiy raqamli pasport fayli (JSON) muvaffaqiyatli yuklab olindi.";
    showToast(msg);
  };

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const roleConfig = ROLES[role] || ROLES.farmer;

  // Role action links for deal flow
  const dealFlowUrl =
    role === "dairy"
      ? "/dashboard/dairy/place-order"
      : role === "driver"
      ? "/dashboard/driver/start-trip"
      : role === "admin"
      ? "/dashboard/admin/disputes"
      : role === "bank"
      ? "/dashboard/bank"
      : "/dashboard/farmer/list-supply";

  const dealFlowLabel =
    role === "dairy"
      ? "Sut Xaridi Buyurtmasi Berish ↗"
      : role === "driver"
      ? "Yangi Marshrutni Boshlash ↗"
      : role === "admin"
      ? "Arbitraj Holatlarini Tekshirish ↗"
      : role === "bank"
      ? "Kliring Portalini Ochish ↗"
      : "Yangi Sut Partiyasini Taklif Qilish ↗";

  return (
    <div className={`min-h-screen py-5 px-3 sm:px-6 relative overflow-x-hidden font-sans antialiased select-none pb-20 transition-colors duration-300 ${
      isDark ? "bg-[#0d1013] text-white" : "bg-[#f4fbf7] text-[#03045e]"
    }`}>
      {/* 1. AMBIENT DREAMLAND BACKDROP AURORAS */}
      <div className="absolute top-10 -left-40 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[150px] opacity-25 animate-pulse"
          style={{ background: "radial-gradient(circle, #00ffc8 0%, #00d3e0 40%, transparent 70%)" }}
        />
      </div>
      <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] pointer-events-none z-0">
        <div
          className="w-full h-full rounded-full blur-[150px] opacity-20 animate-pulse"
          style={{ background: "radial-gradient(circle, #00d3e0 0%, #0099ff 50%, transparent 70%)" }}
        />
      </div>

      {/* Subtle Dot Grid Canvas Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#00d3e0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Unified Luxury Floating Master Canvas */}
      <div className={`relative z-10 max-w-[1420px] mx-auto rounded-[36px] border p-4 sm:p-8 flex flex-col gap-6 transition-colors duration-300 ${
        isDark
          ? "bg-[#14181d]/90 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,153,255,0.18)] border-white/10 text-white"
          : "bg-white/95 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,153,255,0.08)] border-[#ade8f4] text-[#03045e]"
      }`}>

        {/* 1. TOP HEADER NAVIGATION */}
        <header className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
          isDark ? "border-white/10" : "border-[#ade8f4]"
        }`}>
          <Link href={`/dashboard/${role}`} className="flex items-center shrink-0 transition-transform hover:scale-105">
            <ZaminFlowLogo mode={themeMode} size="md" />
          </Link>

          {/* Navigation Pill Tabs - Fully role adaptive */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold backdrop-blur-md">
            <Link
              href={`/dashboard/${role}`}
              className="px-4 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              {t.profileView.backToDashboard}
            </Link>
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] shadow-md font-black">
              {roleConfig.label} {t.profileView.dossierLabel}
            </span>
            <Link
              href={dealFlowUrl}
              className="px-4 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              {t.profileView.dealFlow}
            </Link>
            <Link
              href={
                role === "dairy"
                  ? "/dashboard/dairy/escrow"
                  : role === "bank"
                  ? "/dashboard/bank"
                  : role === "admin"
                  ? "/dashboard/admin/audit"
                  : "/dashboard/farmer/payouts"
              }
              className="px-4 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              {t.profileView.escrowDepository}
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-full p-1 border border-white/10 bg-white/5 text-[11px] font-bold">
              {(["uz", "ru", "en"] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={`px-2.5 py-0.5 rounded-full uppercase transition cursor-pointer ${
                    locale === loc
                      ? "bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black shadow-xs"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>

            <ThemeToggleButton size="sm" />

            <span className="text-xs font-bold bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-3.5 py-1 whitespace-nowrap">
              {roleConfig.label}
            </span>
          </div>
        </header>

        {/* Global Toast Alert */}
        {toastNotice && (
          <div className="bg-[#00ffc8]/15 border border-[#00ffc8]/40 text-[#00ffc8] px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-1">
            <span>{toastNotice}</span>
            <button onClick={() => setToastNotice(null)} className="text-[#00ffc8] cursor-pointer ml-3 font-bold hover:opacity-80">✕</button>
          </div>
        )}

        {/* 2. HERO COVER BANNER & PROFILE CARD */}
        <div className="bg-white/[0.03] rounded-[30px] border border-white/10 overflow-hidden shadow-xs">
          
          {/* Cover Landscape Banner */}
          <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-[#0c2e28] via-[#093a38] to-[#081a28]">
            <div
              className="w-full h-full opacity-30"
              style={{
                backgroundImage: "radial-gradient(#00ffc8 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14181d] via-transparent to-transparent" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#00ffc8] font-mono text-[11px] font-bold flex items-center gap-1.5 border border-[#00ffc8]/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-ping" />
                ZaminFlow Tasdiqlangan Milliy Ishtirokchi
              </span>
            </div>
          </div>

          {/* Profile Header Row with Overlapping Avatar */}
          <div className="px-6 sm:px-10 pb-7 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 -mt-16 sm:-mt-20">
              
              {/* Left: Avatar + Identity */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                <div className="relative inline-block">
                  <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-full border-4 border-[#14181d] shadow-2xl overflow-hidden bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] flex items-center justify-center ring-4 ring-[#00ffc8]/30">
                    {profileState.avatarUrl && !avatarLoadError ? (
                      <img
                        src={profileState.avatarUrl}
                        alt={profileState.fullName}
                        className="w-full h-full object-cover object-[center_18%]"
                        onError={() => setAvatarLoadError(true)}
                      />
                    ) : (
                      <span className="text-3xl font-black text-[#070B14] tracking-wider">
                        {getDisplayInitials(profileState.fullName)}
                      </span>
                    )}
                  </div>
                  {/* Verified check badge */}
                  <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#00ffc8] text-[#070B14] font-black flex items-center justify-center border-2 border-[#14181d] shadow-xs" title="Certified KYB Partner">
                    ✓
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {profileState.fullName}
                    </h1>
                    <span className="text-[11px] font-mono font-bold uppercase bg-[#00ffc8]/15 border border-[#00ffc8]/30 text-[#00ffc8] rounded-full px-3 py-0.5">
                      {profileState.kybVerified ? "✓ KYB Verifikatsiyalangan" : "Tekshiruvda"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#00d3e0] mt-0.5">
                    {profileState.title} &bull; <strong className="text-white">{profileState.organizationName}</strong>
                  </p>
                  <p className="text-xs text-white/50 flex items-center gap-1.5 mt-1 font-medium">
                    <svg className="w-3.5 h-3.5 text-[#00ffc8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{profileState.location}</span>
                  </p>
                </div>
              </div>

              {/* Right: Action Buttons & Communication Icons */}
              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-end pt-2">
                <button
                  type="button"
                  onClick={openEditModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition shadow-xs cursor-pointer active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 text-[#00ffc8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>{t.profileView.editProfile}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-[#00ffc8] hover:border-[#00ffc8]/40 transition cursor-pointer active:scale-95"
                  title={t.profileView.shareTooltip}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleExportDossier}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-[#00ffc8] hover:border-[#00ffc8]/40 transition cursor-pointer active:scale-95"
                  title={t.profileView.exportTooltip}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>

                <a
                  href={`tel:${profileState.phone}`}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-[#00ffc8] hover:border-[#00ffc8]/40 transition cursor-pointer active:scale-95"
                  title={`${t.profileView.callTooltip}: ${profileState.phone}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>

                <a
                  href={`mailto:${profileState.email}`}
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-[#00ffc8] hover:border-[#00ffc8]/40 transition cursor-pointer active:scale-95"
                  title={`${t.profileView.emailTooltip}: ${profileState.email}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>

                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  className={`p-2.5 rounded-full border transition cursor-pointer active:scale-95 ${
                    isBookmarked
                      ? "bg-[#00ffc8] text-[#070B14] border-[#00ffc8] shadow-md shadow-[#00ffc8]/30"
                      : "bg-white/5 text-white/80 border-white/10 hover:border-white/20"
                  }`}
                  title={isBookmarked ? "Tanlanganlar roʻyxatida" : "Tanlanganlarga qoʻshish"}
                >
                  <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

            </div>

            {/* Profile Navigation Tabs - Real switching */}
            <div className="flex items-center gap-6 mt-8 pt-4 border-t border-white/10 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`pb-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "text-[#00ffc8] border-b-2 border-[#00ffc8] font-black"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <span>📋</span>
                <span>{t.profileView.tabs.overview}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={`pb-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "specs"
                    ? "text-[#00ffc8] border-b-2 border-[#00ffc8] font-black"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <span>⚙️</span>
                <span>{t.profileView.tabs.specs}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("contracts")}
                className={`pb-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "contracts"
                    ? "text-[#00ffc8] border-b-2 border-[#00ffc8] font-black"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <span>🏦</span>
                <span>{t.profileView.tabs.contracts}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("team")}
                className={`pb-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "team"
                    ? "text-[#00ffc8] border-b-2 border-[#00ffc8] font-black"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <span>👥</span>
                <span>{t.profileView.tabs.team}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-white/70">
                  {profileState.team.length}
                </span>
              </button>
            </div>

          </div>

        </div>

        {/* 3. DYNAMIC TAB VIEWS WITH LUXURY ACCURACY */}

        {/* TAB 1: OVERVIEW & CAPACITY */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
            {/* Left 8 cols: Bio, KPI cards, Offerings */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* CARD 1: Operational Summary */}
              <div className="bg-white/[0.03] rounded-[28px] p-6 sm:p-7 border border-white/10 hover:border-[#00d3e0]/30 transition-all shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🏢</span>
                    <span>Operatsion Faoliyat va Qisqacha Tavsif</span>
                  </h2>
                  <span className="text-[11px] font-mono font-semibold text-[#00ffc8] bg-[#00ffc8]/10 border border-[#00ffc8]/20 px-2.5 py-0.5 rounded-full">
                    Soliq.uz STIR Tasdiqlangan
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                  {profileState.bio}
                </p>

                {/* Direct Action Callout Banner */}
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-[#00ffc8]/10 via-[#00d3e0]/10 to-transparent border border-[#00ffc8]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white">B2B Savdo Bitimini Boshlash</div>
                    <div className="text-[11px] text-white/50">Agrobank kafolatlangan eskrou depozitariysi orqali xavfsiz hisob-kitob</div>
                  </div>
                  <Link
                    href={dealFlowUrl}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs hover:opacity-95 transition shadow-md shadow-[#00ffc8]/20 whitespace-nowrap"
                  >
                    {dealFlowLabel}
                  </Link>
                </div>
              </div>

              {/* CARD 2: Historical Trading & Clearing Track Record */}
              <div className="bg-white/[0.03] rounded-[28px] p-6 sm:p-7 border border-white/10 hover:border-[#00d3e0]/30 transition-all shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>📊</span>
                    <span>Tarixiy Savdo & Kliring Körsatkiçlari</span>
                  </h2>
                  <span className="text-xs font-bold text-[#00ffc8] font-mono">
                    Ishonch Indeksi: {profileState.trustScore} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {profileState.stats.map((st, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#00ffc8]/30 transition"
                    >
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block font-mono">
                        {st.label}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block">
                        {st.value}
                      </span>
                      <span className="text-[10px] text-[#00ffc8] font-semibold block mt-0.5">
                        {st.sublabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 3: Active Capabilities & Standards */}
              <div className="bg-white/[0.03] rounded-[28px] p-6 sm:p-7 border border-white/10 hover:border-[#00d3e0]/30 transition-all shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>✓</span>
                      <span>Tasdiqlangan Imkoniyatlar & Standartlar</span>
                    </h2>
                    <span className="text-[11px] text-white/50">
                      Hamkorlar bilan savdo qilish rasmiy shartlari
                    </span>
                  </div>
                  <span className="text-xs font-bold bg-[#00ffc8] text-[#070B14] px-2.5 py-0.5 rounded-full font-mono">
                    {profileState.capabilities.length} Ta Faol
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {profileState.capabilities.map((cap, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/40 border border-white/10 text-xs font-semibold text-white/90 shadow-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
                      <span>{cap.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right 4 cols: Bank & Quick Contacts */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* CARD: Bank & Tax Credentials */}
              <div className="bg-white/[0.03] rounded-[28px] p-6 border border-white/10 hover:border-[#00d3e0]/30 transition-all shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>🏦</span>
                    <span>Bank & Soliq Rekvizitlari</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00ffc8]/15 text-[#00ffc8] font-bold">
                    Sinxron
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 block font-mono">
                      Soliq ID (STIR)
                    </span>
                    <span className="font-mono text-white font-bold">{profileState.taxId}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 block font-mono">
                      Xizmat Koʻrsatuvchi Bank
                    </span>
                    <span className="text-white font-medium">{profileState.bankName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 block font-mono">
                      Hisobvaraq (IBAN)
                    </span>
                    <span className="font-mono text-[#00ffc8] text-[11px] break-all">{profileState.iban}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/40 block font-mono">
                      A'zolik Sanasi
                    </span>
                    <span className="text-white/70 font-mono">{profileState.memberSince}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-white/40">Eskrou Regulyatsiyasi</span>
                  <span className="text-[#00ffc8] font-bold">CBU №412</span>
                </div>
              </div>

              {/* CARD: Quick Action Dossier Tools */}
              <div className="bg-white/[0.03] rounded-[28px] p-6 border border-white/10 hover:border-[#00d3e0]/30 transition-all shadow-xs">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Tezkor Dosye Amallari
                </h3>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleShareProfile}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white text-left flex items-center justify-between transition cursor-pointer"
                  >
                    <span>🔗 Profil Havolasini Nusxalash</span>
                    <span className="text-white/40 text-[10px]">Ulashish</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportDossier}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#00ffc8] text-left flex items-center justify-between transition cursor-pointer"
                  >
                    <span>📥 Sertifikatlangan Pasport (JSON)</span>
                    <span className="text-[10px] bg-[#00ffc8]/20 px-2 py-0.5 rounded-md">Yuklab olish</span>
                  </button>
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80 text-left flex items-center justify-between transition cursor-pointer"
                  >
                    <span>✏️ Ma'lumotlarni Yangilash</span>
                    <span className="text-white/40 text-[10px]">Tahrir</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: SPECIFICATIONS & TECHNICAL PASSPORT */}
        {activeTab === "specs" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Row 1: Technical Passport + Quality Titration Bench */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Role-Specific Technical Passport */}
              <div className="bg-white/[0.03] rounded-[28px] p-6 sm:p-7 border border-white/10 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {profileState.roleSpecifics.sectionTitle}
                    </h2>
                    <span className="text-[11px] text-white/50">
                      Texnik jihozlanish va agrosanoat parametrlar pasporti
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30 px-3 py-0.5 rounded-full">
                    Sertifikatlangan
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {profileState.roleSpecifics.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-3"
                    >
                      <span className="text-[11px] text-white/50 uppercase font-mono">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">{item.value}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30 whitespace-nowrap">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Titration & Standards Bench */}
              <div className="bg-white/[0.03] rounded-[28px] p-6 sm:p-7 border border-white/10 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Laboratoriya Titratsiyasi & Sifat Normalari
                    </h2>
                    <span className="text-[11px] text-white/50">
                      O'zDSt 31449-2026 talablari bo'yicha laboratoriya sinovlari
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#00d3e0]/15 text-[#00d3e0] border border-[#00d3e0]/30 px-3 py-0.5 rounded-full">
                    A+ Oliy Sinf
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60">Yoğlilik Körsatkiçi (Fat)</span>
                      <span className="font-bold text-[#00ffc8] font-mono">4.15% (Talab: &gt; 3.2%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] w-[88%]" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60">Quruq Moddalar Qoldiği (SNF)</span>
                      <span className="font-bold text-[#00d3e0] font-mono">8.65% (Talab: &gt; 8.2%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00d3e0] to-[#0099ff] w-[92%]" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60">Sovuq Saqlash Harorati</span>
                      <span className="font-bold text-white font-mono">+3.2°C (Maksimal: +4.0°C)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#00ffc8] w-[96%]" />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60">Somatik Hujayralar Soni</span>
                      <span className="font-bold text-[#00ffc8] font-mono">&lt; 180k / sm³ (Sinf A+)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-[#00ffc8] w-[95%]" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Row 2: Trading Specifications Table */}
            <div className="bg-white/[0.03] rounded-[28px] p-6 sm:p-7 border border-white/10 shadow-xs">
              <h2 className="text-base font-bold text-white pb-3 border-b border-white/10 mb-3">
                Shartnoma & Tijoriy Bitim Parametrlari
              </h2>
              <div className="divide-y divide-white/5">
                {profileState.tradingSpecs.map((spec, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-white/50 font-semibold">{spec.label}</span>
                    <span className="font-mono font-bold text-white">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTRACTS & ESCROW CLEARING */}
        {activeTab === "contracts" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Top Escrow Credentials Banner */}
            <div className="p-6 rounded-[28px] bg-gradient-to-r from-[#00ffc8]/15 via-[#0099ff]/15 to-transparent border border-[#00ffc8]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#00ffc8] text-[#070B14] flex items-center justify-center text-2xl font-black shadow-lg">
                  🏦
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">AgroBank & CBU Rasmiy Eskrou Kafolati</h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Mablagʻlar Markaziy Bankning №412 litsenziyasi asosida maxsus depozitariyda muzlatiladi va laboratoriya tasdigʻidan soʻng 15 daqiqada oʻtkaziladi.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 font-mono text-xs font-bold text-[#00ffc8]">
                  ISO 20022 pacs.008
                </span>
              </div>
            </div>

            {/* Financial Ledger Table */}
            <div className="bg-white/[0.03] rounded-[28px] p-6 sm:p-7 border border-white/10 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Sönggi Bajarilgan Şartnomalar & Kliring Tarixi</h2>
                  <span className="text-[11px] text-white/50">Smart kontrakt audit zanjiridagi tranzaksiyalar</span>
                </div>
                <span className="text-xs font-bold text-[#00ffc8] font-mono">0 ta Nizo (100% Toza)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 uppercase font-mono text-[10px]">
                      <th className="py-2.5 px-3">Şartnoma №</th>
                      <th className="py-2.5 px-3">Kontragent</th>
                      <th className="py-2.5 px-3">Hajm</th>
                      <th className="py-2.5 px-3">Sifat / Nav</th>
                      <th className="py-2.5 px-3">Eskrou Holati</th>
                      <th className="py-2.5 px-3 text-right">Hujjat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3 font-mono text-[#00ffc8] font-bold">#CNT-2026-991</td>
                      <td className="py-3 px-3 text-white font-semibold">Toshkent Sut Zavodi #4</td>
                      <td className="py-3 px-3 font-mono">12,000 Litr</td>
                      <td className="py-3 px-3"><span className="text-[#00ffc8]">Oliy A+ (4.2%)</span></td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30 font-bold text-[10px]">✓ Kliring Bajarildi</span></td>
                      <td className="py-3 px-3 text-right">
                        <button onClick={() => showToast("✓ ISO 20022 Kliring hujjati yuklab olindi.")} className="underline text-white/60 hover:text-white cursor-pointer">Sertifikat ↓</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3 font-mono text-[#00ffc8] font-bold">#CNT-2026-984</td>
                      <td className="py-3 px-3 text-white font-semibold">Samarqand Sut Kombinati LLC</td>
                      <td className="py-3 px-3 font-mono">8,500 Litr</td>
                      <td className="py-3 px-3"><span className="text-[#00ffc8]">Oliy A+ (4.1%)</span></td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30 font-bold text-[10px]">✓ Kliring Bajarildi</span></td>
                      <td className="py-3 px-3 text-right">
                        <button onClick={() => showToast("✓ ISO 20022 Kliring hujjati yuklab olindi.")} className="underline text-white/60 hover:text-white cursor-pointer">Sertifikat ↓</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3 font-mono text-[#00ffc8] font-bold">#CNT-2026-972</td>
                      <td className="py-3 px-3 text-white font-semibold">Jizzax Organik Sut Zavodi</td>
                      <td className="py-3 px-3 font-mono">15,000 Litr</td>
                      <td className="py-3 px-3"><span className="text-[#00d3e0]">1-Sinf (3.9%)</span></td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-[#00ffc8]/15 text-[#00ffc8] border border-[#00ffc8]/30 font-bold text-[10px]">✓ Kliring Bajarildi</span></td>
                      <td className="py-3 px-3 text-right">
                        <button onClick={() => showToast("✓ ISO 20022 Kliring hujjati yuklab olindi.")} className="underline text-white/60 hover:text-white cursor-pointer">Sertifikat ↓</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TEAM & LEADERSHIP DIRECTORY */}
        {activeTab === "team" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Boşqaruv & Mas'ul Mutaxassislar Röyxati</h2>
                <p className="text-xs text-white/50 mt-0.5">Tezkor aloqa va buyurtmalar ijrosiga javobgar vakillar</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTeamModalOpen(true)}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs hover:opacity-90 transition shadow-md cursor-pointer active:scale-95"
              >
                + Yangi Mas'ul Xodim Qöşiş
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profileState.team.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.03] rounded-[24px] p-5 border border-white/10 hover:border-[#00ffc8]/40 transition flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-tr from-[#00ffc8] to-[#0099ff] flex items-center justify-center shrink-0 shadow-md">
                      {member.avatarUrl && !failedTeamImages[idx] ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover object-[center_18%]"
                          onError={() =>
                            setFailedTeamImages((prev) => ({ ...prev, [idx]: true }))
                          }
                        />
                      ) : (
                        <span className="text-sm font-black text-[#070B14]">
                          {getDisplayInitials(member.name)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      <p className="text-xs text-[#00d3e0] font-mono mt-0.5">{member.role}</p>
                      <span className="inline-block mt-1 text-[10px] bg-white/5 border border-white/10 text-white/60 px-2 py-0.5 rounded-md font-mono">
                        Tasdiqlangan Vakil
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    {member.phone ? (
                      <a
                        href={`tel:${member.phone}`}
                        className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-[11px] transition flex items-center gap-1.5"
                      >
                        <span>📞</span>
                        <span>{member.phone}</span>
                      </a>
                    ) : (
                      <span className="text-white/40 text-[11px]">Aloqa mavjud</span>
                    )}

                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-[#00ffc8] transition"
                        title="Email yuborish"
                      >
                        ✉️
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12161a] border border-[#00d3e0]/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-black text-white">Profil Ma'lumotlarini Tahrirlash</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70">F.I.Ş (Töliq Ism)</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/70">Lavozim / Ixtisoslik</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/70">Tashkilot / Ferma Nomi</label>
                  <input
                    type="text"
                    value={editOrgName}
                    onChange={(e) => setEditOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70">Rasmiy Manzil</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/70">Telefon Raqam</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/70">Elektron Pochta</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70">Faoliyat Tavsifi (Bio)</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/70">Xizmat Körsatuvçi Bank</label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/70">Hisobvaraq (IBAN)</label>
                  <input
                    type="text"
                    value={editIban}
                    onChange={(e) => setEditIban(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-white/10 text-white/70 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs cursor-pointer shadow-md"
                >
                  O'zgarishlarni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TEAM MEMBER MODAL */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12161a] border border-[#00d3e0]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white">Yangi Mas'ul Xodim Qöşiş</h3>
              <button
                type="button"
                onClick={() => setIsAddTeamModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTeamMember} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70">F.I.SH</label>
                <input
                  type="text"
                  placeholder="Masalan: Sardor Rustamov"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70">Lavozimi / Mas'uliyati</label>
                <input
                  type="text"
                  placeholder="Masalan: Bosh Laborant & Qabul Mutaxassisi"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70">Telefon Raqami</label>
                <input
                  type="text"
                  placeholder="+998 90 123 45 67"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70">Email Manzili</label>
                <input
                  type="email"
                  placeholder="xodim@zaminflow.uz"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#00ffc8]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddTeamModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-white/10 text-white/70 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#00ffc8] to-[#0099ff] text-[#070B14] font-black text-xs cursor-pointer shadow-md"
                >Qöşiş</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
