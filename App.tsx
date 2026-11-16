// @ts-nocheck
import React, { useState, useEffect } from "react";

// ============================================================================
// DÁN LINK FIREBASE REALTIME DATABASE CỦA BẠN VÀO GIỮA 2 DẤU NGOẶC KÉP DƯỚI ĐÂY:
// ============================================================================
const DEFAULT_FIREBASE_URL =
  "https://lophoaduonganhtuananh-37e47-default-rtdb.asia-southeast1.firebasedatabase.app/";

const TEACHER_INFO = {
  fullName: "Dương Anh Tuấn Anh",
  subNote: "Nhật Hạ",
  email: "anhduonganhtuan@gmail.com",
  defaultPass: "LeMinh02@Ughy",
  quote:
    "Mỗi phản ứng hóa học đều cần năng lượng hoạt hóa — Mỗi bước tiến của con đều khởi nguồn từ sự đồng hành bền bỉ giữa Gia đình và Nhà trường.",
};

// ============================================================================
// DANH SÁCH NĂM HỌC & PHÂN LOẠI TIN TỨC CHO PHỤ HUYNH DỄ THEO DÕI
// ============================================================================
const DEFAULT_ACADEMIC_YEARS = ["2024 - 2025", "2025 - 2026", "2026 - 2027"];

const NEWS_CATEGORIES = [
  {
    id: "ACADEMIC",
    label: "Học thuật",
    badge: "📘 Học thuật",
    desc: "Tài liệu mới tải lên, lộ trình chương, đề cương & hướng dẫn ôn tập",
    color: "bg-sky-100 text-sky-900 border-sky-300",
    activeBtn: "bg-[#1B3B48] text-white",
  },
  {
    id: "HOMEWORK_DEADLINE",
    label: "Bài tập & Hạn nộp Deadline",
    badge: "⏰ Bài tập & Deadline",
    desc: "Thông báo bài tập mới đăng, thời hạn hoàn thành (Deadline) & nhắc nộp bài",
    color: "bg-rose-100 text-rose-900 border-rose-300",
    activeBtn: "bg-rose-700 text-white",
  },
  {
    id: "TUITION",
    label: "Thông báo học phí",
    badge: "💳 Thông báo học phí",
    desc: "Lịch thu học phí theo tháng/kỳ, xác nhận hoàn thành học phí",
    color: "bg-amber-100 text-amber-900 border-amber-300",
    activeBtn: "bg-[#9C6644] text-white",
  },
  {
    id: "CLASS_NOTICE",
    label: "Thông báo lớp học",
    badge: "📢 Thông báo lớp học",
    desc: "Thay đổi lịch học, lịch nghỉ lễ, họp phụ huynh & tình hình chuyên cần",
    color: "bg-emerald-100 text-emerald-900 border-emerald-300",
    activeBtn: "bg-[#2C4A3E] text-white",
  },
];

const getNewsCategoryMeta = (catId) => {
  return (
    NEWS_CATEGORIES.find((c) => c.id === catId) ||
    NEWS_CATEGORIES.find((c) => c.id === "CLASS_NOTICE")
  );
};

// Danh sách Hình thức / Kỳ thi cho Ngân hàng Đề thi (Mục 06)
const EXAM_CATEGORIES = [
  { id: "GK1_10", label: "GKI Lớp 10 (Giữa kỳ I - Khối 10)", short: "GKI Lớp 10", grade: "10" },
  { id: "HK1_10", label: "HKI Lớp 10 (Học kỳ I - Khối 10)", short: "HKI Lớp 10", grade: "10" },
  { id: "GK2_10", label: "GKII Lớp 10 (Giữa kỳ II - Khối 10)", short: "GKII Lớp 10", grade: "10" },
  { id: "HK2_10", label: "HKII Lớp 10 (Học kỳ II - Khối 10)", short: "HKII Lớp 10", grade: "10" },
  { id: "GK1_11", label: "GKI Lớp 11 (Giữa kỳ I - Khối 11)", short: "GKI Lớp 11", grade: "11" },
  { id: "HK1_11", label: "HKI Lớp 11 (Học kỳ I - Khối 11)", short: "HKI Lớp 11", grade: "11" },
  { id: "GK2_11", label: "GKII Lớp 11 (Giữa kỳ II - Khối 11)", short: "GKII Lớp 11", grade: "11" },
  { id: "HK2_11", label: "HKII Lớp 11 (Học kỳ II - Khối 11)", short: "HKII Lớp 11", grade: "11" },
  { id: "GK1_12", label: "GKI Lớp 12 (Giữa kỳ I - Khối 12)", short: "GKI Lớp 12", grade: "12" },
  { id: "HK1_12", label: "HKI Lớp 12 (Học kỳ I - Khối 12)", short: "HKI Lớp 12", grade: "12" },
  { id: "GK2_12", label: "GKII Lớp 12 (Giữa kỳ II - Khối 12)", short: "GKII Lớp 12", grade: "12" },
  { id: "HK2_12", label: "HKII Lớp 12 (Học kỳ II - Khối 12)", short: "HKII Lớp 12", grade: "12" },
  { id: "THPT_QG", label: "THPT Quốc gia / Tốt nghiệp THPT & Đại học", short: "THPT Quốc gia", grade: "12" },
  { id: "HSG_DGNL", label: "Đề Học sinh giỏi / Đánh giá năng lực", short: "HSG / ĐGNL", grade: "ALL" },
];

const getExamCategoryMeta = (catId) => {
  return (
    EXAM_CATEGORIES.find((c) => c.id === catId) || {
      id: catId || "THPT_QG",
      label: catId || "Đề thi chung",
      short: catId || "Đề thi",
    }
  );
};

// Kiểm tra Bài tập đã quá hạn nộp theo thời gian thực hay chưa
const getHomeworkDeadlineStatus = (hw, nowObj) => {
  if (!hw || !hw.deadlineISO) {
    return { isExpired: false, label: hw?.dueDate || "Đang mở nộp bài", remainingText: "" };
  }
  const targetMs = new Date(hw.deadlineISO).getTime();
  if (isNaN(targetMs)) {
    return { isExpired: false, label: hw?.dueDate || "Đang mở nộp bài", remainingText: "" };
  }
  const nowMs = nowObj.getTime();
  const diffMs = targetMs - nowMs;
  const formattedDeadline = new Date(hw.deadlineISO).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  if (diffMs <= 0) {
    return {
      isExpired: true,
      formattedDeadline,
      label: `Đã khóa nộp (${formattedDeadline})`,
      remainingText: "⛔ Đã hết thời gian nộp bài",
    };
  }
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const mins = totalMinutes % 60;
  let rem = "";
  if (days > 0) rem = `Còn ${days} ngày ${hours} giờ`;
  else if (hours > 0) rem = `Còn ${hours} giờ ${mins} phút`;
  else rem = `Còn ${mins} phút`;
  return {
    isExpired: false,
    formattedDeadline,
    label: `Hạn chót: ${formattedDeadline}`,
    remainingText: `🟢 Đang mở (${rem})`,
  };
};

// ============================================================================
// 1. CHƯƠNG TRÌNH HÓA HỌC 10, 11, 12 (CTGDPT 2018 - DANH PHÁP IUPAC)
// ============================================================================
const DEFAULT_CURRICULUM = {
  "10": [
    {
      id: "10-c1",
      timeline: "Tháng 09 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 30/09",
      title: "Chương 1: Cấu tạo nguyên tử",
      formulas: "p⁺, n, e⁻ • Z, A • Cấu hình electron (1s² 2s² 2p⁶...)",
      requirements: [
        "Trình bày được thành phần nguyên tử (hạt nhân và vỏ nguyên tử; kích thước, khối lượng, điện tích của proton, neutron, electron).",
        "Nêu được khái niệm nguyên tố hóa học, số hiệu nguyên tử (Z), số khối (A), đồng vị và tính được nguyên tử khối trung bình.",
        "Trình bày được mô hình hiện đại về sự chuyển động của electron; khái niệm orbital nguyên tử (AO s, p, d, f) và viết được cấu hình electron nguyên tử (Z ≤ 30).",
      ],
    },
    {
      id: "10-c2",
      timeline: "Tháng 10 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 31/10",
      title: "Chương 2: Bảng tuần hoàn các nguyên tố hóa học",
      formulas: "Chu kì, Nhóm A/B • R₂Oₙ • R(OH)ₙ • Độ âm điện (χ)",
      requirements: [
        "Nêu được nguyên tắc sắp xếp các nguyên tố trong bảng tuần hoàn dựa trên cấu hình electron; cấu tạo bảng tuần hoàn (ô, chu kì, nhóm).",
        "Giải thích được xu hướng biến đổi bán kính nguyên tử, độ âm điện, tính kim loại và tính phi kim của các nguyên tố trong một chu kì và một nhóm A.",
        "Trình bày được xu hướng biến đổi thành phần và tính acid/base của các oxide và hydroxide theo chu kì; phát biểu được định luật tuần hoàn.",
      ],
    },
    {
      id: "10-c3",
      timeline: "Tháng 11 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 30/11",
      title: "Chương 3: Liên kết hóa học",
      formulas: "NaCl, MgO, CO₂, NH₃, NH₄⁺ • Liên kết σ, π • Liên kết hydrogen",
      requirements: [
        "Vận dụng được quy tắc octet trong quá trình hình thành liên kết hóa học của các nguyên tố nhóm A.",
        "Trình bày được sự hình thành liên kết ion, liên kết cộng hóa trị (đơn, đôi, ba, cho – nhận), phân biệt liên kết σ và liên kết π.",
        "Nêu được bản chất và vai trò của liên kết hydrogen và tương tác van der Waals đối với nhiệt độ nóng chảy, nhiệt độ sôi của các chất.",
      ],
    },
    {
      id: "10-c4",
      timeline: "Tháng 12 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 31/12",
      title: "Chương 4: Phản ứng oxi hóa – khử",
      formulas: "Fe²⁺ → Fe³⁺ + 1e • MnO₄⁻, Cr₂O₇²⁻, HNO₃, H₂SO₄ đặc",
      requirements: [
        "Xác định được số oxi hóa của nguyên tử các nguyên tố trong đơn chất, hợp chất và ion.",
        "Nêu được khái niệm chất oxi hóa, chất khử, sự oxi hóa, sự khử và lập được phương trình hóa học của phản ứng oxi hóa – khử bằng phương pháp thăng bằng electron.",
      ],
    },
    {
      id: "10-c5",
      timeline: "Tháng 01 – Tháng 02",
      targetDate: "Hoàn thành trước 28/02",
      title: "Chương 5: Năng lượng hóa học",
      formulas: "ΔrH°₂₉₈ • ΔfH°₂₉₈ • Năng lượng liên kết (E_b)",
      requirements: [
        "Phân biệt được phản ứng tỏa nhiệt (ΔrH°₂₉₈ < 0) và phản ứng thu nhiệt (ΔrH°₂₉₈ > 0); nêu được ý nghĩa của biến thiên enthalpy chuẩn.",
        "Tính được biến thiên enthalpy của phản ứng dựa vào nhiệt tạo thành chuẩn (ΔfH°₂₉₈) hoặc năng lượng liên kết (E_b).",
      ],
    },
    {
      id: "10-c6",
      timeline: "Tháng 03 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 31/03",
      title: "Chương 6: Tốc độ phản ứng hóa học",
      formulas: "v = k·C_Aᵃ·C_Bᵇ • Hệ số nhiệt độ Van't Hoff (γ)",
      requirements: [
        "Trình bày được khái niệm tốc độ phản ứng, tốc độ trung bình và biểu thức định luật tác dụng khối lượng.",
        "Giải thích được các yếu tố ảnh hưởng đến tốc độ phản ứng (nồng độ, nhiệt độ, áp suất, diện tích bề mặt, chất xúc tác) và hệ số nhiệt độ Van't Hoff.",
      ],
    },
    {
      id: "10-c7",
      timeline: "Tháng 04 – Tháng 05",
      targetDate: "Hoàn thành trước 15/05",
      title: "Chương 7: Nguyên tố nhóm VIIA (Halogen)",
      formulas: "F₂, Cl₂, Br₂, I₂ • HF, HCl, HBr, HI • NaClO, CaOCl₂ • AgNO₃",
      requirements: [
        "Phát biểu được xu hướng biến đổi tính chất vật lí và tính chất hóa học (tính oxi hóa giảm dần từ fluorine đến iodine) của các đơn chất nhóm VIIA.",
        "Giải thích được xu hướng biến đổi tính acid của dãy hydrohalic acid (HF < HCl < HBr < HI), tính khử của các ion halide (F⁻, Cl⁻, Br⁻, I⁻) và nhận biết bằng dung dịch AgNO₃.",
      ],
    },
  ],
  "11": [
    {
      id: "11-c1",
      timeline: "Tháng 09 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 30/09",
      title: "Chương 1: Cân bằng hóa học",
      formulas: "K_C = [C]ᶜ[D]ᵈ / ([A]ᵃ[B]ᵇ) • H⁺, OH⁻ • pH = -lg[H⁺]",
      requirements: [
        "Trình bày được khái niệm phản ứng thuận nghịch, trạng thái cân bằng hóa học, hằng số cân bằng (K_C) và vận dụng nguyên lí chuyển dịch cân bằng Le Chatelier.",
        "Nêu được khái niệm sự điện li, thuyết acid – base của Brønsted – Lowry, tính pH của dung dịch và nguyên tắc chuẩn độ acid – base.",
      ],
    },
    {
      id: "11-c2",
      timeline: "Tháng 10 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 31/10",
      title: "Chương 2: Nitrogen và Sulfur",
      formulas: "N₂, NH₃, NH₄⁺, HNO₃ • S, SO₂, SO₃, H₂SO₄, SO₄²⁻",
      requirements: [
        "Giải thích được tính trơ của đơn chất nitrogen ở nhiệt độ thường, tính chất của ammonia (NH₃), muối ammonium (NH₄⁺), nitric acid (HNO₃) và hiện tượng phú dưỡng.",
        "Trình bày được tính chất của sulfur (S), sulfur dioxide (SO₂), sulfuric acid (H₂SO₄ loãng và đặc) và cách nhận biết ion sulfate (SO₄²⁻) bằng Ba²⁺.",
      ],
    },
    {
      id: "11-c3",
      timeline: "Tháng 11 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 30/11",
      title: "Chương 3: Đại cương về Hóa học hữu cơ",
      formulas: "-OH, -CHO, -COOH, -NH₂ • Phổ IR & Phổ khối lượng MS",
      requirements: [
        "Nêu được khái niệm hợp chất hữu cơ, nhóm chức, đồng đẳng, đồng phân và sử dụng phổ hồng ngoại (IR) để xác định nhóm chức cơ bản.",
        "Trình bày được các phương pháp tách biệt và tinh chế hợp chất hữu cơ (chưng cất, chiết, kết tinh, sắc kí cột) và thiết lập công thức phân tử từ phổ khối lượng (MS).",
      ],
    },
    {
      id: "11-c4",
      timeline: "Tháng 12 – Tháng 01",
      targetDate: "Hoàn thành trước 25/01",
      title: "Chương 4: Hydrocarbon",
      formulas: "CₙH₂ₙ₊₂ • CₙH₂ₙ • CₙH₂ₙ₋₂ • C₆H₆, C₆H₅CH₃, C₆H₅CH=CH₂",
      requirements: [
        "Gọi được tên của alkane, alkene, alkyne, arene và viết được các đồng phân cấu tạo, đồng phân hình học (cis-trans).",
        "Trình bày được tính chất hóa học đặc trưng: phản ứng thế, cracking, reforming của alkane; phản ứng cộng (quy tắc Markovnikov), trùng hợp của alkene/alkyne; phản ứng của arene.",
      ],
    },
    {
      id: "11-c5",
      timeline: "Tháng 02 – Tháng 03",
      targetDate: "Hoàn thành trước 25/03",
      title: "Chương 5: Dẫn xuất Halogen – Alcohol – Phenol",
      formulas: "R-X • C₂H₅OH, C₂H₄(OH)₂, C₃H₅(OH)₃ • C₆H₅OH",
      requirements: [
        "Gọi được tên của dẫn xuất halogen, alcohol, phenol; giải thích được ảnh hưởng của liên kết hydrogen đến nhiệt độ sôi và độ tan của alcohol.",
        "Trình bày được phản ứng thế nguyên tử halogen, phản ứng tách HX (quy tắc Zaitsev); phản ứng của alcohol (tác dụng Na, Cu(OH)₂, tạo alkene/ether, oxi hóa) và phenol.",
      ],
    },
    {
      id: "11-c6",
      timeline: "Tháng 04 – Tháng 05",
      targetDate: "Hoàn thành trước 15/05",
      title: "Chương 6: Hợp chất Carbonyl (Aldehyde – Ketone) – Carboxylic acid",
      formulas: "HCHO, CH₃CHO, CH₃COCH₃ • [Ag(NH₃)₂]OH • RCOOH",
      requirements: [
        "Gọi tên của aldehyde, ketone, carboxylic acid; trình bày phản ứng khử, oxi hóa aldehyde (thuốc thử Tollens [Ag(NH₃)₂]⁺, Cu(OH)₂/OH⁻, phản ứng tạo iodoform CHI₃).",
        "Trình bày được tính acid và phản ứng ester hóa thuận nghịch của carboxylic acid; ứng dụng điều chế trong thực tiễn.",
      ],
    },
  ],
  "12": [
    {
      id: "12-c1",
      timeline: "Tháng 09 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 30/09",
      title: "Chương 1: Ester – Lipid",
      formulas: "RCOOR' • CH₃COOC₂H₅ • (RCOO)₃C₃H₅ • RCOONa",
      requirements: [
        "Nêu được khái niệm, đặc điểm cấu tạo phân tử và gọi được tên các ester đơn giản.",
        "Trình bày được tính chất hóa học đặc trưng của ester (phản ứng thủy phân trong môi trường acid H⁺ và xà phòng hóa trong dung dịch kiềm OH⁻) và phương pháp điều chế.",
        "Trình bày được khái niệm lipid, chất béo, acid béo; phân biệt được xà phòng và chất giặt rửa tổng hợp.",
      ],
    },
    {
      id: "12-c2",
      timeline: "Tháng 10 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 31/10",
      title: "Chương 2: Carbohydrate",
      formulas: "C₆H₁₂O₆ (Glucose, Fructose) • C₁₂H₂₂O₁₁ • (C₆H₁₀O₅)ₙ",
      requirements: [
        "Nêu được khái niệm, cách phân loại carbohydrate; trình bày được cấu tạo dạng mạch hở và mạch vòng của glucose và fructose.",
        "Trình bày được tính chất hóa học cơ bản của glucose, fructose (tính chất polyalcohol, aldehyde, phản ứng lên men) và của saccharose, maltose, tinh bột, cellulose.",
      ],
    },
    {
      id: "12-c3",
      timeline: "Tháng 11 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 30/11",
      title: "Chương 3: Hợp chất chứa Nitrogen",
      formulas: "R-NH₂, C₆H₅NH₂ • H₂N-R-COOH • Liên kết -CO-NH-",
      requirements: [
        "Phân loại và gọi tên các amine; trình bày tính base và phản ứng đặc trưng của amine, aniline (tác dụng với nước bromine tạo kết tủa 2,4,6-tribromoaniline).",
        "Nêu được cấu tạo phân tử (dạng ion lưỡng cực), tính chất lưỡng tính, tính điện di của amino acid; phản ứng tạo peptide.",
        "Trình bày được cấu trúc, phản ứng thủy phân, phản ứng màu biuret với Cu(OH)₂/OH⁻ của peptide/protein và vai trò xúc tác sinh học của enzyme.",
      ],
    },
    {
      id: "12-c4",
      timeline: "Tháng 12 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 31/12",
      title: "Chương 4: Polymer",
      formulas: "(-CH₂-CH₂-)ₙ (PE) • (-CH₂-CHCl-)ₙ (PVC) • Nylon-6,6",
      requirements: [
        "Viết được công thức cấu tạo và gọi tên của các polymer thông dụng (chất dẻo, tơ, cao su, keo dán tổng hợp).",
        "Trình bày được tính chất vật lí, tính chất hóa học (giữ nguyên mạch, cắt mạch, tăng mạch) và phương pháp điều chế polymer bằng phản ứng trùng hợp hoặc trùng ngưng.",
      ],
    },
    {
      id: "12-c5",
      timeline: "Tháng 01 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 31/01",
      title: "Chương 5: Pin điện và Điện phân",
      formulas: "Mⁿ⁺/M • E°_pin = E°_(+) - E°_(-) • Định luật Faraday",
      requirements: [
        "Mô tả được cặp oxi hóa – khử của kim loại; sử dụng bảng thế điện cực chuẩn để so sánh tính oxi hóa/khử và dự đoán chiều phản ứng.",
        "Nêu được cấu tạo, nguyên tắc hoạt động của pin Galvani và tính được sức điện động chuẩn (E°_pin).",
        "Trình bày được nguyên tắc (thứ tự) điện phân dung dịch và điện phân nóng chảy; áp dụng trong sản xuất Al, Na, Cl₂ và mạ điện.",
      ],
    },
    {
      id: "12-c6",
      timeline: "Tháng 02 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 28/02",
      title: "Chương 6: Đại cương về Kim loại",
      formulas: "Nhiệt luyện (CO, H₂, Al) • Thủy luyện • Điện phân • Ăn mòn điện hóa",
      requirements: [
        "Giải thích được tính chất vật lí chung và tính chất hóa học cơ bản của kim loại dựa trên cấu tạo nguyên tử và liên kết kim loại.",
        "Trình bày được các phương pháp tách kim loại (nhiệt luyện, thủy luyện, điện phân) và quá trình tái chế kim loại.",
        "Nêu được khái niệm hợp kim, hai dạng ăn mòn kim loại (hóa học và điện hóa) cùng các phương pháp chống ăn mòn.",
      ],
    },
    {
      id: "12-c7",
      timeline: "Tháng 03 (Tuần 1 – Tuần 4)",
      targetDate: "Hoàn thành trước 31/03",
      title: "Chương 7: Nguyên tố nhóm IA và nhóm IIA",
      formulas: "Na, K, Mg, Ca, Ba • NaHCO₃, Na₂CO₃, CaCO₃, CaSO₄·2H₂O • Ca²⁺, Mg²⁺",
      requirements: [
        "Trình bày được trạng thái tự nhiên, xu hướng biến đổi tính chất vật lí và tính khử của các kim loại nhóm IA và nhóm IIA.",
        "Giải thích được tính chất và ứng dụng của NaCl, NaHCO₃, Na₂CO₃, CaCO₃, CaSO₄.",
        "Nêu được khái niệm nước cứng (tạm thời, vĩnh cửu, toàn phần chứa nhiều ion Ca²⁺, Mg²⁺), tác hại và các phương pháp làm mềm nước cứng.",
      ],
    },
    {
      id: "12-c8",
      timeline: "Tháng 04 – Tháng 05",
      targetDate: "Hoàn thành trước 15/05",
      title: "Chương 8: Sơ lược về dãy Kim loại chuyển tiếp thứ nhất và Phức chất",
      formulas: "Cr, Mn, Fe, Cu • [Ag(NH₃)₂]⁺ • [Cu(NH₃)₄]²⁺ • [CoCl₄]²⁻",
      requirements: [
        "Nêu được đặc điểm cấu hình electron [Ar]3d¹⁻¹⁰4s¹⁻², các trạng thái oxi hóa phổ biến, màu sắc của các ion kim loại chuyển tiếp dãy thứ nhất (Fe²⁺, Fe³⁺, Cu²⁺, Cr³⁺, MnO₄⁻).",
        "Trình bày được nguyên tử trung tâm, phối tử (ligand), liên kết cho – nhận trong phức chất và dấu hiệu của phản ứng tạo phức trong dung dịch.",
      ],
    },
  ],
};

// ============================================================================
// 2. BỘ SỔ TAY BẢNG CÁC CHẤT CẦN NHỚ, CHỈ THỊ pH & DỤNG CỤ THÍ NGHIỆM
// ============================================================================
const FATTY_ACIDS_TABLE = [
  {
    name: "Palmitic acid",
    iupac: "Hexadecanoic acid",
    formula: "C₁₅H₃₁COOH (CH₃[CH₂]₁₄COOH)",
    triglyceride: "Tripalmitin: (C₁₅H₃₁COO)₃C₃H₅ (M = 806)",
    molarMass: "256 g/mol",
    property: "Acid béo no (0 liên kết π C=C) • Chất rắn màu trắng ở nhiệt độ thường",
  },
  {
    name: "Stearic acid",
    iupac: "Octadecanoic acid",
    formula: "C₁₇H₃₅COOH (CH₃[CH₂]₁₆COOH)",
    triglyceride: "Tristearin: (C₁₇H₃₅COO)₃C₃H₅ (M = 890)",
    molarMass: "284 g/mol",
    property: "Acid béo no (0 liên kết π C=C) • Chất rắn ở nhiệt độ thường (mỡ động vật)",
  },
  {
    name: "Oleic acid",
    iupac: "cis-Octadec-9-enoic acid",
    formula: "C₁₇H₃₃COOH",
    triglyceride: "Triolein: (C₁₇H₃₃COO)₃C₃H₅ (M = 884)",
    molarMass: "282 g/mol",
    property: "Acid béo không no (1 liên kết đôi C=C dạng cis, ω-9) • Chất lỏng (dầu thực vật)",
  },
  {
    name: "Linoleic acid",
    iupac: "(9Z,12Z)-Octadeca-9,12-dienoic acid",
    formula: "C₁₇H₃₁COOH",
    triglyceride: "Trilinolein: (C₁₇H₃₁COO)₃C₃H₅ (M = 878)",
    molarMass: "280 g/mol",
    property: "Acid béo không no (2 liên kết đôi C=C, thuộc nhóm omega-6) • Chất lỏng",
  },
];

const AMINO_ACIDS_TABLE = [
  {
    symbol: "Gly",
    commonName: "Glycine",
    iupacName: "Aminoethanoic acid",
    formula: "H₂N–CH₂–COOH",
    molarMass: "75",
    groups: "1 nhóm -NH₂ • 1 nhóm -COOH",
    litmus: "Không làm đổi màu quỳ tím (pH ≈ 6,0)",
  },
  {
    symbol: "Ala",
    commonName: "Alanine",
    iupacName: "2-Aminopropanoic acid",
    formula: "CH₃–CH(NH₂)–COOH",
    molarMass: "89",
    groups: "1 nhóm -NH₂ • 1 nhóm -COOH",
    litmus: "Không làm đổi màu quỳ tím (pH ≈ 6,0)",
  },
  {
    symbol: "Val",
    commonName: "Valine",
    iupacName: "2-Amino-3-methylbutanoic acid",
    formula: "(CH₃)₂CH–CH(NH₂)–COOH",
    molarMass: "117",
    groups: "1 nhóm -NH₂ • 1 nhóm -COOH",
    litmus: "Không làm đổi màu quỳ tím (pH ≈ 6,0)",
  },
  {
    symbol: "Glu",
    commonName: "Glutamic acid",
    iupacName: "2-Aminopentanedioic acid",
    formula: "HOOC–CH₂–CH₂–CH(NH₂)–COOH",
    molarMass: "147",
    groups: "1 nhóm -NH₂ • 2 nhóm -COOH",
    litmus: "Làm quỳ tím hóa ĐỎ/HỒNG (môi trường acid, pH ≈ 3,2) • Muối monosodium glutamate là bột ngọt",
  },
  {
    symbol: "Lys",
    commonName: "Lysine",
    iupacName: "2,6-Diaminohexanoic acid",
    formula: "H₂N–[CH₂]₄–CH(NH₂)–COOH",
    molarMass: "146",
    groups: "2 nhóm -NH₂ • 1 nhóm -COOH",
    litmus: "Làm quỳ tím hóa XANH (môi trường kiềm, pH ≈ 9,7)",
  },
];

const PH_INDICATORS_TABLE = [
  {
    indicator: "Quỳ tím (Litmus)",
    acidColor: "Đỏ / Hồng (pH < 5,0)",
    neutralColor: "Tím (5,0 ≤ pH ≤ 8,0)",
    baseColor: "Xanh lam (pH > 8,0)",
    application: "Nhận biết nhanh dung dịch acid (HCl, H₂SO₄, Glu) và base (NaOH, Ba(OH)₂, NH₃, alkylamine, Lys).",
  },
  {
    indicator: "Phenolphthalein",
    acidColor: "Không màu (pH < 8,2)",
    neutralColor: "Không màu (pH < 8,2)",
    baseColor: "Hồng / Đỏ tím (8,2 ≤ pH ≤ 10,0)",
    application: "Dùng phổ biến trong chuẩn độ acid mạnh – base mạnh (chuẩn độ HCl bằng dung dịch chuẩn NaOH).",
  },
  {
    indicator: "Methyl orange (Methyl da cam)",
    acidColor: "Đỏ (pH < 3,1)",
    neutralColor: "Vàng cam (3,1 ≤ pH ≤ 4,4)",
    baseColor: "Vàng (pH > 4,4)",
    application: "Chuẩn độ các base yếu hoặc phân biệt môi trường acid mạnh.",
  },
  {
    indicator: "Hồ tinh bột + Iodine (I₂)",
    acidColor: "Xanh tím đặc trưng ở nhiệt độ thường",
    neutralColor: "Mất màu khi đun nóng",
    baseColor: "Hiện lại màu xanh tím khi để nguội",
    application: "Nhận biết tinh bột (starch) hoặc nhận biết đơn chất iodine (I₂).",
  },
];

const LAB_EQUIPMENT_TABLE = [
  {
    name: "Burette (Buret chuẩn độ)",
    category: "Đo thể tích chính xác & Chuẩn độ",
    usage: "Dùng để nhỏ từ từ dung dịch chuẩn (biết trước nồng độ, VD: NaOH hoặc KMnO₄) xuống bình tam giác trong thí nghiệm chuẩn độ acid – base hoặc oxi hóa – khử.",
    note: "Tráng burette bằng chính dung dịch chuẩn sau khi rửa bằng nước cất; đọc vạch ở đáy mặt khum.",
  },
  {
    name: "Pipette (Pipet bầu / Pipet vạch)",
    category: "Lấy thể tích dung dịch chính xác",
    usage: "Hút chính xác một thể tích dung dịch xác định (VD: 10,0 mL dung dịch HCl hoặc FeSO₄) cho vào bình tam giác để đem đi chuẩn độ.",
    note: "Sử dụng quả bóp cao su để hút dung dịch, tuyệt đối không hút bằng miệng.",
  },
  {
    name: "Bình tam giác (Erlenmeyer flask)",
    category: "Dụng cụ chứa phản ứng chuẩn độ",
    usage: "Đựng dung dịch cần chuẩn độ và vài giọt chất chỉ thị (phenolphthalein). Thiết kế cổ hẹp giúp lắc đều dung dịch mà không bị văng ra ngoài.",
    note: "Chỉ tráng bình tam giác bằng nước cất, KHÔNG tráng bằng dung dịch cần chuẩn độ để tránh làm sai lệch số mol.",
  },
  {
    name: "Bình định mức (Volumetric flask)",
    category: "Pha chế dung dịch chuẩn",
    usage: "Dùng để pha chế dung dịch có nồng độ chính xác cao với thể tích cố định (50 mL, 100 mL, 250 mL...).",
    note: "Thêm nước cất đến gần vạch thì dùng ống hút nhỏ giọt thêm từng giọt cho đến khi đáy mặt khum chạm đúng vạch định mức.",
  },
  {
    name: "Phễu chiết (Separatory funnel)",
    category: "Tách chất lỏng không tan vào nhau",
    usage: "Dùng trong phương pháp chiết lỏng – lỏng để tách hai chất lỏng không hòa tan vào nhau (VD: tách tinh dầu và nước, hoặc tách ester nhẹ hơn nước).",
    note: "Chất lỏng có khối lượng riêng lớn hơn nằm ở lớp dưới được xả qua khóa trước.",
  },
  {
    name: "Ống sinh hàn (Condenser) & Bình cầu có nhánh",
    category: "Chưng cất tách chất",
    usage: "Dùng trong phương pháp chưng cất (dựa vào sự khác nhau về nhiệt độ sôi, VD: chưng cất ethanol – nước). Ống sinh hàn làm lạnh hơi thành chất lỏng.",
    note: "Nước làm lạnh trong ống sinh hàn luôn phải cho chảy NGƯỢC CHIỀU với chiều đi của hơi (vào đầu thấp, ra đầu cao).",
  },
];

const CHEM_REFERENCE_NOTES = [
  { formula: "AgCl↓", color: "Kết tủa trắng", note: "Không tan trong dung dịch HNO₃, tan trong dung dịch NH₃ tạo phức [Ag(NH₃)₂]⁺." },
  { formula: "AgBr↓", color: "Kết tủa vàng nhạt", note: "Không tan trong HNO₃, ít tan trong dung dịch NH₃ đậm đặc." },
  { formula: "AgI↓", color: "Kết tủa vàng đậm", note: "Không tan trong HNO₃ và không tan trong dung dịch NH₃." },
  { formula: "BaSO₄↓, CaSO₄↓", color: "Kết tủa trắng", note: "BaSO₄ bền, không tan trong các dung dịch acid mạnh." },
  { formula: "Cu(OH)₂↓", color: "Kết tủa xanh lam", note: "Tan trong NH₃ tạo phức [Cu(NH₃)₄](OH)₂ màu xanh thẫm; hòa tan polyalcohol (glucose, glycerol)." },
  { formula: "Fe(OH)₂↓ → Fe(OH)₃↓", color: "Trắng xanh → Nâu đỏ", note: "Fe(OH)₂ kết tủa trắng xanh dễ bị oxi hóa ngoài không khí thành Fe(OH)₃ màu nâu đỏ." },
  { formula: "Al(OH)₃↓, Zn(OH)₂↓", color: "Kết tủa keo trắng", note: "Hydroxide lưỡng tính, tan trong cả dung dịch acid mạnh (H⁺) và kiềm mạnh (OH⁻); Zn(OH)₂ tan thêm trong NH₃." },
  { formula: "C₆H₂Br₃OH↓ / C₆H₂Br₃NH₂↓", color: "Kết tủa trắng", note: "Phản ứng nhận biết phenol hoặc aniline bằng nước bromine (Br₂)." },
];

const FLASHCARDS_BANK = [
  { id: "sys-1", grade: "10", front: "Ở điều kiện chuẩn (25°C, 1 bar), 1 mol chất khí bất kì chiếm thể tích bao nhiêu lít?", back: "V = 24,79 L/mol (Công thức tính số mol khí ở đkc: n = V / 24,79)." },
  { id: "sys-2", grade: "10", front: "Trong một chu kì (từ trái sang phải), bán kính nguyên tử và độ âm điện biến đổi ra sao?", back: "Bán kính nguyên tử giảm dần; Độ âm điện tăng dần (do điện tích hạt nhân tăng)." },
  { id: "sys-3", grade: "11", front: "Theo thuyết Brønsted – Lowry, định nghĩa Acid và Base là gì?", back: "Acid là chất cho proton (H⁺); Base là chất nhận proton (H⁺)." },
  { id: "sys-4", grade: "11", front: "Thuốc thử nhận biết ion sulfate (SO₄²⁻) trong dung dịch là gì?", back: "Dung dịch muối barium (BaCl₂, Ba(NO₃)₂) trong môi trường acid tạo kết tủa trắng BaSO₄↓ không tan." },
  { id: "sys-5", grade: "12", front: "Công thức và phân tử khối (M) của 5 amino acid thường gặp: Gly, Ala, Val, Glu, Lys?", back: "Gly = 75 • Ala = 89 • Val = 117 • Lys = 146 (quỳ hóa xanh) • Glu = 147 (quỳ hóa đỏ)." },
  { id: "sys-6", grade: "12", front: "Công thức của 4 acid béo tiêu biểu và phân tử khối của chúng?", back: "Palmitic: C₁₅H₃₁COOH (M=256) • Stearic: C₁₇H₃₅COOH (M=284) • Oleic: C₁₇H₃₃COOH (M=282) • Linoleic: C₁₇H₃₁COOH (M=280)." },
];

const QUICK_QUIZ_BANK = [
  {
    q: "Amino acid nào sau đây làm quỳ tím chuyển sang màu xanh?",
    options: ["Glycine (Gly)", "Alanine (Ala)", "Lysine (Lys)", "Glutamic acid (Glu)"],
    ans: 2,
    explain: "Lysine có 2 nhóm -NH₂ và 1 nhóm -COOH nên dung dịch có môi trường base, làm quỳ tím hóa xanh.",
  },
  {
    q: "Chất béo lỏng (dầu thực vật) chứa chủ yếu gốc acid béo nào sau đây?",
    options: ["Palmitic acid & Stearic acid", "Oleic acid & Linoleic acid", "Formic acid & Acetic acid", "Glutamic acid"],
    ans: 1,
    explain: "Triolein và Trilinolein chứa gốc acid béo không no nên ở trạng thái lỏng ở điều kiện thường.",
  },
  {
    q: "Trong phương pháp chưng cất, nước làm lạnh trong ống sinh hàn được dẫn vào theo chiều nào?",
    options: ["Từ trên xuống dưới (cùng chiều hơi)", "Từ dưới lên trên (ngược chiều hơi)", "Chỉ cho vào một nửa ống", "Không cần dùng nước làm lạnh"],
    ans: 1,
    explain: "Nước lạnh đi từ đầu thấp lên đầu cao (ngược chiều hơi) để luôn điền đầy ống sinh hàn và làm lạnh hiệu quả nhất.",
  },
  {
    q: "Phân tử khối (M) của Tristearin (C₁₇H₃₅COO)₃C₃H₅ là bao nhiêu?",
    options: ["806 g/mol", "884 g/mol", "890 g/mol", "878 g/mol"],
    ans: 2,
    explain: "Tripalmitin = 806; Triolein = 884; Tristearin = 890; Trilinolein = 878.",
  },
  {
    q: "Khi chuẩn độ dung dịch HCl bằng dung dịch chuẩn NaOH với chỉ thị phenolphthalein, điểm tương đương nhận biết khi nào?",
    options: ["Dung dịch chuyển từ hồng sang không màu", "Dung dịch xuất hiện màu hồng nhạt bền trong 20–30 giây", "Xuất hiện kết tủa trắng", "Sủi bọt khí không màu"],
    ans: 1,
    explain: "Trong môi trường acid phenolphthalein không màu, khi vừa dư 1 giọt NaOH dung dịch sẽ chuyển sang màu hồng nhạt.",
  },
];

// ============================================================================
// 3. CẤU HÌNH THỜI KHÓA BIỂU LINH HOẠT & ĐỒNG BỘ LỊCH THỰC TẾ
// ============================================================================
const DAYS_OF_WEEK = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];

const DEFAULT_TIME_SLOTS = [
  { id: "MORNING", label: "Ca Sáng (07:30 - 11:00)", startTime: "07:30", endTime: "11:00" },
  { id: "AFTERNOON", label: "Ca Chiều (14:00 - 17:30)", startTime: "14:00", endTime: "17:30" },
  { id: "EVENING_1", label: "Ca Tối 1 (18:00 - 19:30)", startTime: "18:00", endTime: "19:30" },
  { id: "EVENING_2", label: "Ca Tối 2 (19:45 - 21:15)", startTime: "19:45", endTime: "21:15" },
  { id: "EVENING_3", label: "Ca Tối Muộn (21:00 - 22:30)", startTime: "21:00", endTime: "22:30" },
];

const toDateKey = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getMondayOfDate = (dateObj) => {
  const d = new Date(dateObj);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const getWeekDaysInfo = (weekOffset = 0) => {
  const now = new Date();
  const currentMonday = getMondayOfDate(now);
  const targetMonday = new Date(currentMonday);
  targetMonday.setDate(currentMonday.getDate() + weekOffset * 7);

  const weekKey = toDateKey(targetMonday);
  const todayKey = toDateKey(now);

  const days = DAYS_OF_WEEK.map((dayLabel, idx) => {
    const dt = new Date(targetMonday);
    dt.setDate(targetMonday.getDate() + idx);
    const dateKey = toDateKey(dt);
    const shortDate = `${String(dt.getDate()).padStart(2, "0")}/${String(
      dt.getMonth() + 1
    ).padStart(2, "0")}`;
    const fullDate = `${shortDate}/${dt.getFullYear()}`;
    return {
      dayOfWeek: dayLabel,
      dateObj: dt,
      dateKey,
      shortDate,
      fullDate,
      isToday: dateKey === todayKey,
    };
  });

  const sunday = days[6];
  return {
    weekKey,
    weekLabel: `Tuần từ ${days[0].fullDate} đến ${sunday.fullDate}`,
    days,
  };
};

const getLiveSessionStatus = (dayDateKey, startTimeStr, endTimeStr, nowObj) => {
  const todayKey = toDateKey(nowObj);
  if (dayDateKey < todayKey) {
    return { code: "PAST", label: "Đã qua", color: "bg-black/25 text-gray-200" };
  }
  if (dayDateKey > todayKey) {
    return null;
  }
  const parseMin = (str) => {
    if (!str || !str.includes(":")) return null;
    const [h, m] = str.split(":").map((x) => parseInt(x, 10));
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };
  const startM = parseMin(startTimeStr);
  const endM = parseMin(endTimeStr);
  const nowM = nowObj.getHours() * 60 + nowObj.getMinutes();

  if (startM !== null && endM !== null) {
    if (nowM >= startM && nowM <= endM) {
      return {
        code: "LIVE",
        label: "🟢 Đang diễn ra",
        color: "bg-emerald-400 text-[#1B3B48] animate-pulse",
      };
    }
    if (nowM < startM) {
      const diff = startM - nowM;
      const hLeft = Math.floor(diff / 60);
      const mLeft = diff % 60;
      return {
        code: "UPCOMING",
        label:
          hLeft > 0
            ? `🟡 Sau ${hLeft}g${mLeft}p`
            : `🟡 Bắt đầu sau ${mLeft} phút`,
        color: "bg-[#E9C46A] text-[#1B3B48]",
      };
    }
    return {
      code: "FINISHED_TODAY",
      label: "✓ Đã học hôm nay",
      color: "bg-white/20 text-white",
    };
  }
  return {
    code: "TODAY",
    label: "Hôm nay",
    color: "bg-[#E9C46A] text-[#1B3B48]",
  };
};

const INITIAL_STATE = {
  teacherPassword: TEACHER_INFO.defaultPass,
  academicYears: DEFAULT_ACADEMIC_YEARS,
  currentAcademicYear: "2026 - 2027",
  curriculum: DEFAULT_CURRICULUM,
  timeSlots: DEFAULT_TIME_SLOTS,
  classes: [],
  students: [],
  announcements: [],
  calendarEvents: [],
  documents: [],
  examPapers: [],
  examSubmissions: [],
  homeworks: [],
  homeworkSubmissions: [],
  customFlashcards: [],
  attendanceSessions: [],
  achievements: [],
  sosQuestions: [],
  chemFeedPosts: [],
  lastUpdated: "",
};

// ============================================================================
// HỆ THỐNG LƯU TRỮ ĐA TẦNG (LOCALSTORAGE NHẸ + INDEXEDDB + FIREBASE TIẾT KIỆM BĂNG THÔNG)
// ============================================================================
const safeGetStorage = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (e) {
    return fallback;
  }
};

const safeSetStorage = (key, val) => {
  try {
    localStorage.setItem(key, val);
    return true;
  } catch (e) {
    return false;
  }
};

const stripHeavyBase64 = (dataObj) => {
  if (!dataObj || typeof dataObj !== "object") return dataObj;
  return {
    ...dataObj,
    classes: (dataObj.classes || []).map((c) => ({
      ...c,
      todayCustomDocDataUrl: "",
    })),
    documents: (dataObj.documents || []).map((d) => ({
      ...d,
      fileDataUrl: "",
    })),
    homeworks: (dataObj.homeworks || []).map((h) => ({
      ...h,
      fileDataUrl: "",
    })),
    homeworkSubmissions: (dataObj.homeworkSubmissions || []).map((s) => ({
      ...s,
      fileDataUrl: "",
    })),
    examPapers: (dataObj.examPapers || []).map((ex) => ({
      ...ex,
      fileDataUrl: "",
    })),
    announcements: (dataObj.announcements || []).map((a) => ({
      ...a,
      attachmentDataUrl: "",
    })),
    chemFeedPosts: (dataObj.chemFeedPosts || []).map((p) => ({
      ...p,
      imageDataUrl: "",
      comments: (p.comments || []).map((cm) => ({
        ...cm,
        attachmentDataUrl: "",
      })),
    })),
  };
};

const IDB_NAME = "NhatHaClassroomDB_v8";
const IDB_STORE = "app_state";

const saveToIndexedDB = (dataObj) => {
  try {
    if (typeof window === "undefined" || !window.indexedDB) return;
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(dataObj, "latest");
    };
  } catch (err) {}
};

const loadFromIndexedDB = (callback) => {
  try {
    if (typeof window === "undefined" || !window.indexedDB) return;
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(IDB_STORE, "readonly");
      const getReq = tx.objectStore(IDB_STORE).get("latest");
      getReq.onsuccess = () => {
        if (getReq.result) callback(getReq.result);
      };
    };
  } catch (err) {}
};

export default function App() {
  useEffect(() => {
    if (!document.getElementById("tailwind-cdn-script")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn-script";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  const [toastMsg, setToastMsg] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    const saved = safeGetStorage("data_nhatha_read_notifs", "[]");
    try {
      return JSON.parse(saved) || [];
    } catch (e) {
      return [];
    }
  });

  const markAllNotificationsRead = (idsList) => {
    const merged = Array.from(new Set([...readNotifIds, ...idsList]));
    setReadNotifIds(merged);
    safeSetStorage("data_nhatha_read_notifs", JSON.stringify(merged));
  };

  const markSingleNotificationRead = (id) => {
    if (!id || readNotifIds.includes(id)) return;
    const next = [...readNotifIds, id];
    setReadNotifIds(next);
    safeSetStorage("data_nhatha_read_notifs", JSON.stringify(next));
  };

  const notify = (text, type = "info") => {
    setToastMsg({ text, type, id: Date.now() });
  };

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 4200);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const askConfirm = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  };

  const [realTimeNow, setRealTimeNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTimeNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [firebaseUrl, setFirebaseUrl] = useState(() => {
    const saved = safeGetStorage("data_nhatha_firebase_url", "");
    return DEFAULT_FIREBASE_URL || saved || "";
  });
  const [tempFirebaseInput, setTempFirebaseInput] = useState(firebaseUrl);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [lastSyncTime, setLastSyncTime] = useState("");
  const [showCloudModal, setShowCloudModal] = useState(false);

  const normalizeLoadedData = (parsed) => ({
    ...INITIAL_STATE,
    ...parsed,
    teacherPassword: parsed?.teacherPassword || TEACHER_INFO.defaultPass,
    academicYears:
      parsed?.academicYears && parsed.academicYears.length > 0
        ? parsed.academicYears
        : DEFAULT_ACADEMIC_YEARS,
    currentAcademicYear:
      parsed?.currentAcademicYear || INITIAL_STATE.currentAcademicYear,
    curriculum: parsed?.curriculum || DEFAULT_CURRICULUM,
    timeSlots:
      parsed?.timeSlots && parsed.timeSlots.length > 0
        ? parsed.timeSlots
        : DEFAULT_TIME_SLOTS,
    homeworks: parsed?.homeworks || [],
    homeworkSubmissions: parsed?.homeworkSubmissions || [],
    customFlashcards: parsed?.customFlashcards || [],
    attendanceSessions: parsed?.attendanceSessions || [],
    classes: parsed?.classes || [],
    students: parsed?.students || [],
    announcements: parsed?.announcements || [],
    calendarEvents: parsed?.calendarEvents || [],
    documents: parsed?.documents || [],
    examPapers: parsed?.examPapers || [],
    examSubmissions: parsed?.examSubmissions || [],
    sosQuestions: parsed?.sosQuestions || [],
    chemFeedPosts: parsed?.chemFeedPosts || [],
    achievements: (parsed?.achievements || []).filter(
      (a) => !String(a.id || "").startsWith("ACH_SAMPLE_")
    ),
  });

  const [appData, setAppData] = useState(() => {
    const fullLocal = safeGetStorage("data_nhatha_classroom_v8", null);
    const coreLocal = safeGetStorage("data_nhatha_core_v8", null);
    let bestData = null;

    if (fullLocal) {
      try {
        bestData = JSON.parse(fullLocal);
      } catch (e) {}
    }
    if (coreLocal) {
      try {
        const parsedCore = JSON.parse(coreLocal);
        if (
          !bestData ||
          Number(parsedCore.lastUpdatedTs || 0) >
            Number(bestData.lastUpdatedTs || 0)
        ) {
          bestData = parsedCore;
        }
      } catch (e) {}
    }
    return bestData ? normalizeLoadedData(bestData) : INITIAL_STATE;
  });

  useEffect(() => {
    loadFromIndexedDB((idbData) => {
      if (!idbData || typeof idbData !== "object") return;
      setAppData((prev) => {
        const idbTs = Number(idbData.lastUpdatedTs || 0);
        const curTs = Number(prev.lastUpdatedTs || 0);
        if (idbTs >= curTs) {
          return normalizeLoadedData(idbData);
        }
        return prev;
      });
    });
  }, []);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState(
    () => appData.currentAcademicYear || "2026 - 2027"
  );
  const [showYearManagerModal, setShowYearManagerModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");

  const [publicHonorFilter, setPublicHonorFilter] = useState("ALL");
  const [publicHonorYearFilter, setPublicHonorYearFilter] = useState("ALL");

  const [currentUser, setCurrentUser] = useState(null);
  const [loginAccount, setLoginAccount] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [navStack, setNavStack] = useState(["home"]);
  const activeView = navStack[navStack.length - 1];

  const navigateTo = (view) => {
    if (!currentUser) return;
    if (view === "students_admin" && currentUser.role !== "teacher") {
      notify("Chỉ tài khoản Giáo viên mới có quyền truy cập khu vực này.", "error");
      return;
    }
    if (view === activeView) return;
    setNavStack((prev) => [...prev, view]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (navStack.length > 1) {
      setNavStack((prev) => prev.slice(0, prev.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setNavStack(["home"]);
    }
  };

  const matchesSelectedYear = (itemYear) => {
    if (selectedAcademicYear === "ALL") return true;
    if (!itemYear) return true;
    return itemYear === selectedAcademicYear;
  };

  const isSameClass = (clsIdA, clsIdB) => {
    return (
      String(clsIdA || "").trim().toUpperCase() ===
      String(clsIdB || "").trim().toUpperCase()
    );
  };

  const getStudentsOfClass = (classId, studentsList = appData.students) => {
    return (studentsList || []).filter((s) => isSameClass(s.classId, classId));
  };

  // ============================================================================
  // ĐỒNG BỘ FIREBASE REALTIME DATABASE TIẾT KIỆM BĂNG THÔNG & CHỐNG GHI ĐÈ NGƯỢC
  // ============================================================================
  const cleanFirebaseBaseUrl = (rawUrl) => {
    if (!rawUrl || !rawUrl.trim()) return "";
    let u = rawUrl.trim().replace(/\\/+$/, "");
    if (!u.startsWith("http")) u = "https://" + u;
    return u;
  };

  const cleanFirebaseEndpoint = (rawUrl) => {
    const base = cleanFirebaseBaseUrl(rawUrl);
    return base ? `${base}/classroom_nhatha_v8.json` : "";
  };

  const lastLocalSaveTsRef = React.useRef(Number(appData.lastUpdatedTs || 0));
  const hasPendingUnsyncedChangesRef = React.useRef(false);

  const persistLocalMultiLayer = (payload) => {
    const lightPayload = stripHeavyBase64(payload);
    safeSetStorage("data_nhatha_core_v8", JSON.stringify(lightPayload));
    const okFull = safeSetStorage(
      "data_nhatha_classroom_v8",
      JSON.stringify(payload)
    );
    if (!okFull) {
      safeSetStorage("data_nhatha_classroom_v8", JSON.stringify(lightPayload));
    }
    saveToIndexedDB(payload);
  };

  const pushPayloadToFirebase = async (payload, autoStripOnFail = true) => {
    const endpoint = cleanFirebaseEndpoint(firebaseUrl);
    if (!endpoint) return false;

    setSyncStatus("syncing");
    try {
      const bodyStr = JSON.stringify(payload);
      const finalBodyStr =
        bodyStr.length > 6 * 1024 * 1024
          ? JSON.stringify(stripHeavyBase64(payload))
          : bodyStr;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: finalBodyStr,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      hasPendingUnsyncedChangesRef.current = false;
      setSyncStatus("synced");
      setLastSyncTime(new Date().toLocaleTimeString("vi-VN"));
      return true;
    } catch (e) {
      if (autoStripOnFail) {
        try {
          const lightBody = JSON.stringify(stripHeavyBase64(payload));
          const resRetry = await fetch(endpoint, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: lightBody,
          });
          if (resRetry.ok) {
            hasPendingUnsyncedChangesRef.current = false;
            setSyncStatus("synced");
            setLastSyncTime(new Date().toLocaleTimeString("vi-VN"));
            return true;
          }
        } catch (retryErr) {}
      }
      hasPendingUnsyncedChangesRef.current = true;
      setSyncStatus("error");
      return false;
    }
  };

  const fetchFromFirebase = async (silent = false) => {
    const base = cleanFirebaseBaseUrl(firebaseUrl);
    const endpoint = cleanFirebaseEndpoint(firebaseUrl);
    if (!base || !endpoint) return;

    if (Date.now() - lastLocalSaveTsRef.current < 20000) return;

    if (hasPendingUnsyncedChangesRef.current) {
      await pushPayloadToFirebase(appData, true);
      return;
    }

    try {
      if (silent) {
        const tsRes = await fetch(
          `${base}/classroom_nhatha_v8/lastUpdatedTs.json`
        );
        if (!tsRes.ok) return;
        const remoteTsOnly = Number((await tsRes.json()) || 0);
        const currentLocalTs = Number(
          appData.lastUpdatedTs || lastLocalSaveTsRef.current || 0
        );
        if (remoteTsOnly <= currentLocalTs) {
          return;
        }
      } else {
        setSyncStatus("syncing");
      }

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Network error");
      const remoteData = await res.json();
      if (remoteData && typeof remoteData === "object") {
        const remoteTs = Number(remoteData.lastUpdatedTs || 0);
        const localTs = Number(
          appData.lastUpdatedTs || lastLocalSaveTsRef.current || 0
        );

        if (localTs > remoteTs) {
          await pushPayloadToFirebase(appData, true);
          return;
        }

        const merged = normalizeLoadedData(remoteData);
        setAppData(merged);
        persistLocalMultiLayer(merged);
        setLastSyncTime(new Date().toLocaleTimeString("vi-VN"));
      }
      setSyncStatus("synced");
    } catch (err) {
      setSyncStatus("error");
    }
  };

  const saveToAll = async (nextData) => {
    const nowTs = Date.now();
    lastLocalSaveTsRef.current = nowTs;
    const payload = {
      ...nextData,
      lastUpdated: new Date().toLocaleString("vi-VN"),
      lastUpdatedTs: nowTs,
    };
    setAppData(payload);
    persistLocalMultiLayer(payload);
    await pushPayloadToFirebase(payload, true);
  };

  const handleCleanFirebaseStorage = () => {
    askConfirm(
      "Hệ thống sẽ dọn sạch các tệp đính kèm Base64 nặng đang làm đầy bộ nhớ Firebase, nhưng GIỮ NGUYÊN 100% danh sách Lớp học, Học sinh, Điểm số, Lịch học, Bản tin và các đường link Google Drive. Bạn có muốn thực hiện ngay không?",
      async () => {
        const cleaned = stripHeavyBase64(appData);
        await saveToAll(cleaned);
        notify(
          "🧹 Đã giải phóng bộ nhớ Firebase thành công! Toàn bộ Lớp học, Học sinh và Điểm số được bảo toàn.",
          "success"
        );
      }
    );
  };

  const handleExportBackupJSON = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sao_luu_Lop_Hoa_${new Date()
      .toLocaleDateString("vi-VN")
      .replace(/\\//g, "-")}.json`;
    a.click();
    notify("📦 Đã tải tệp sao lưu toàn bộ dữ liệu (.json) về máy!", "success");
  };

  useEffect(() => {
    if (firebaseUrl) {
      fetchFromFirebase(false);
      const timer = setInterval(() => {
        fetchFromFirebase(true);
      }, 25000);
      return () => clearInterval(timer);
    }
  }, [firebaseUrl]);

  // ============================================================================
  // TẢI ẢNH & TÀI LIỆU LINH HOẠT (NÉN SIÊU NHẸ CHỐNG TRÀN FIREBASE)
  // ============================================================================
  const handleFlexibleFileUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxW = 720;
          const scale = img.width > maxW ? maxW / img.width : 1;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.55);
          callback({
            fileName: file.name,
            fileType: "image",
            dataUrl: compressedDataUrl,
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      if (file.size > 600 * 1024) {
        notify(
          "⚠️ Tệp lớn hơn 600KB! Để tránh tràn bộ nhớ 1GB của Firebase, bạn hãy tải tệp này lên Google Drive rồi dán đường link vào ô Link tài liệu nhé.",
          "warn"
        );
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        callback({
          fileName: file.name,
          fileType: "document",
          dataUrl: ev.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };


  // ============================================================================
  // XỬ LÝ ĐĂNG NHẬP BẢO MẬT (CHỈ 1 TÀI KHOẢN GV DUY NHẤT)
  // ============================================================================
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    const input = loginAccount.trim().toLowerCase();
    const pass = loginPassword.trim();

    if (input === TEACHER_INFO.email.toLowerCase()) {
      const validTeacherPass =
        appData.teacherPassword || TEACHER_INFO.defaultPass;
      if (pass === validTeacherPass) {
        setCurrentUser({
          role: "teacher",
          name: TEACHER_INFO.fullName,
          email: TEACHER_INFO.email,
        });
        setNavStack(["home"]);
        setLoginPassword("");
        return;
      } else {
        setLoginError("Mật khẩu tài khoản Giáo viên không chính xác.");
        return;
      }
    }

    const foundStudent = appData.students.find(
      (s) =>
        (s.email && s.email.toLowerCase() === input) ||
        (s.id && s.id.toLowerCase() === input) ||
        (s.name && s.name.toLowerCase() === input)
    );

    if (foundStudent && foundStudent.password === pass) {
      setCurrentUser({
        role: "student",
        studentId: foundStudent.id,
        name: foundStudent.name,
        classId: foundStudent.classId,
        grade: foundStudent.grade || "12",
        email: foundStudent.email,
      });
      setSelectedStudentId(foundStudent.id);
      if (foundStudent.academicYear) {
        setSelectedAcademicYear(foundStudent.academicYear);
      }
      setNavStack(["home"]);
      setLoginPassword("");
      return;
    }

    setLoginError(
      "Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin do Thầy Dương Anh Tuấn Anh cung cấp."
    );
  };

  // ============================================================================
  // TRẠNG THÁI QUẢN LÝ TRONG CÁC MỤC
  // ============================================================================
  const [selectedGradeTab, setSelectedGradeTab] = useState("12");
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const yearFilteredClasses = (appData.classes || []).filter((c) =>
    matchesSelectedYear(c.academicYear)
  );
  const yearFilteredStudents = (appData.students || []).filter((s) =>
    matchesSelectedYear(s.academicYear)
  );

  useEffect(() => {
    if (currentUser?.role === "student") {
      setSelectedStudentId(currentUser.studentId);
    } else if (
      appData.students.length > 0 &&
      (!selectedStudentId ||
        !appData.students.some((s) => s.id === selectedStudentId))
    ) {
      setSelectedStudentId(appData.students[0].id);
    }
  }, [currentUser, appData.students, selectedStudentId]);

  useEffect(() => {
    const firstClassId = appData.classes?.[0]?.id || "";
    const firstClassGrade = appData.classes?.[0]?.grade || "12";
    if (firstClassId) {
      setSingleStudent((prev) =>
        appData.classes.some((c) => isSameClass(c.id, prev.classId))
          ? prev
          : { ...prev, classId: firstClassId }
      );
      setCalForm((prev) =>
        prev.targetScope === "ALL" ||
        appData.classes.some((c) => isSameClass(c.id, prev.targetScope))
          ? prev
          : { ...prev, targetScope: firstClassId }
      );
      setDocForm((prev) =>
        prev.classId === "ALL" ||
        appData.classes.some((c) => isSameClass(c.id, prev.classId))
          ? prev
          : { ...prev, classId: firstClassId, grade: firstClassGrade }
      );
      setAchForm((prev) =>
        appData.classes.some((c) => isSameClass(c.id, prev.classId))
          ? prev
          : { ...prev, classId: firstClassId }
      );
    }
  }, [appData.classes]);

  const activeStudent =
    currentUser?.role === "student"
      ? appData.students.find((s) => s.id === currentUser.studentId)
      : appData.students.find((s) => s.id === selectedStudentId) ||
        yearFilteredStudents[0] ||
        appData.students[0] ||
        null;

  // Form Thông báo & Chế độ gửi Email + Phân loại Tin tức (Mục 01)
  const [newsCategoryFilter, setNewsCategoryFilter] = useState("ALL");
  const [annForm, setAnnForm] = useState({
    title: "",
    category: "CLASS_NOTICE",
    sendMode: "BULK",
    classId: "ALL",
    targetStudentId: "",
    content: "",
    attachmentName: "",
    attachmentType: "",
    attachmentDataUrl: "",
    sendEmailNow: true,
  });
  const [emailPreviewModal, setEmailPreviewModal] = useState(null);

  // ============================================================================
  // TRẠNG THÁI THỜI KHÓA BIỂU LINH HOẠT THEO TUẦN & ĐÍNH KÈM TÀI LIỆU BUỔI HỌC (MỤC 02)
  // ============================================================================
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const activeWeekInfo = getWeekDaysInfo(selectedWeekOffset);

  const [calendarFilterClass, setCalendarFilterClass] = useState("ALL");
  const [calForm, setCalForm] = useState({
    dayOfWeek: "Thứ Hai",
    slotMode: "EXISTING",
    slotId: "EVENING_1",
    newSlotLabel: "",
    startTime: "18:00",
    endTime: "19:30",
    repeatMode: "WEEK_ONLY",
    targetScope: "10A1",
    title: "",
    roomOrNote: "",
    attachedDocId: "",
    lessonDocTitle: "",
    lessonDocUrl: "",
    lessonDocFileName: "",
    lessonDocDataUrl: "",
  });

  const [showSlotManager, setShowSlotManager] = useState(false);
  const [newSlotForm, setNewSlotForm] = useState({
    label: "",
    startTime: "21:00",
    endTime: "22:00",
  });

  const [editingCalEvent, setEditingCalEvent] = useState(null);
  const [editingClassDocsModal, setEditingClassDocsModal] = useState(null);

  // Form Chỉnh sửa Lộ trình Chương & YCCĐ + Tải tài liệu theo từng Lớp/Chương (Mục 03)
  const [editingChapter, setEditingChapter] = useState(null);
  const [newChapterForm, setNewChapterForm] = useState({
    grade: "12",
    timeline: "",
    targetDate: "",
    title: "",
    formulas: "",
    requirementsText: "",
  });
  const [curriculumClassFilter, setCurriculumClassFilter] = useState("ALL");
  const [activeChapterUploadId, setActiveChapterUploadId] = useState(null);
  const [chapterDocForm, setChapterDocForm] = useState({
    title: "",
    classId: "ALL",
    externalUrl: "",
    note: "",
    fileName: "",
    fileType: "",
    fileDataUrl: "",
  });

  // Form Bài kiểm tra trên lớp (Mục 04)
  const [classTestForm, setClassTestForm] = useState({
    testName: "",
    testType: "Kiểm tra định kỳ / 1 tiết",
    score: "",
    maxScore: "10",
    date: new Date().toLocaleDateString("vi-VN"),
    teacherNote: "",
    attachmentName: "",
    attachmentType: "",
    attachmentDataUrl: "",
  });

  // Form Tài liệu học tập (Mục 05A) & Giao Bài tập Trực tiếp qua Mail (Mục 05B)
  const [docForm, setDocForm] = useState({
    title: "",
    grade: "12",
    classId: "12A1",
    chapterId: "12-c1",
    externalUrl: "",
    note: "",
    fileName: "",
    fileType: "",
    fileDataUrl: "",
  });
  const [docFilterClass, setDocFilterClass] = useState("ALL");
  const [docFilterChapter, setDocFilterChapter] = useState("ALL");

  const [hwForm, setHwForm] = useState({
    title: "",
    sendMode: "BULK",
    classId: "ALL",
    targetStudentId: "",
    dueDate: "",
    deadlineISO: "",
    description: "",
    fileUrl: "",
    submissionPortalLink:
      typeof window !== "undefined" ? window.location.href : "",
    fileName: "",
    fileType: "",
    fileDataUrl: "",
    sendEmailNow: true,
  });

  const [hwSubForm, setHwSubForm] = useState({
    homeworkId: "",
    studentId: "",
    studentNameCustom: "",
    studentClassCustom: "",
    studentNote: "",
    fileName: "",
    fileType: "",
    fileDataUrl: "",
  });
  const [previewSubmissionModal, setPreviewSubmissionModal] = useState(null);
  const [rosterFilterClass, setRosterFilterClass] = useState("ALL");
  const [rosterSearchQuery, setRosterSearchQuery] = useState("");

  const [selectedTrackerHwId, setSelectedTrackerHwId] = useState("ALL");
  const [trackerStatusFilter, setTrackerStatusFilter] = useState("ALL");
  const [gradingInputs, setGradingInputs] = useState({});

  // Form Đề thi & App Thi thử (Mục 06)
  const [examForm, setExamForm] = useState({
    title: "",
    academicYear: appData.currentAcademicYear || "2026 - 2027",
    examCategory: "HK1_10",
    classId: "ALL",
    duration: "50 phút",
    fileUrl: "",
    appLink: "",
    fileName: "",
    fileType: "",
    fileDataUrl: "",
  });
  const [examFilterYear, setExamFilterYear] = useState("ALL");
  const [examFilterCategory, setExamFilterCategory] = useState("ALL");
  const [subForm, setSubForm] = useState({
    examId: "",
    claimedScore: "",
    imageName: "",
    imageDataUrl: "",
  });

  // Form Thành tích cá nhân: HSG, Đậu Đại học (Mục 07)
  const [achForm, setAchForm] = useState({
    studentName: "",
    classId: "12A1",
    academicYear: appData.currentAcademicYear || "2026 - 2027",
    category: "Đậu Đại học",
    title: "",
    scoreDetail: "",
    imageName: "",
    imageDataUrl: "",
  });

  // Sổ tay Hóa học, Tạo Flashcard Cá nhân, Pomodoro & Mini-Quiz (Mục 08)
  const [refTab, setRefTab] = useState("FATTY_ACIDS");
  const [molCalc, setMolCalc] = useState({
    mass: "",
    molarMass: "",
    gasVolume: "",
    solutionVolume: "",
  });
  const [flashcardSource, setFlashcardSource] = useState("ALL");
  const [flashcardGrade, setFlashcardGrade] = useState("12");
  const [cardIndex, setCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [newFlashcardForm, setNewFlashcardForm] = useState({
    grade: "12",
    topic: "",
    front: "",
    back: "",
  });

  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    if (!pomoRunning) return;
    const t = setInterval(() => {
      setPomoSeconds((prev) => {
        if (prev <= 1) {
          setPomoRunning(false);
          notify("🎉 Hoàn thành 25 phút tập trung ôn tập Hóa học!", "success");
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [pomoRunning]);

  const [sosInput, setSosInput] = useState("");
  const [replyTexts, setReplyTexts] = useState({});

  // Trạng thái Mục 10: Chuyện Hóa Học Hằng Ngày & Góc Hỏi Bài Khó
  const [feedFilterType, setFeedFilterType] = useState("ALL");
  const [feedFilterGrade, setFeedFilterGrade] = useState("ALL");
  const [newPostForm, setNewPostForm] = useState({
    postType: "DAILY_STORY",
    grade: "ALL",
    classId: "ALL",
    title: "",
    content: "",
    articleUrl: "",
    rewardPoints: 5,
    correctAnswerHint: "",
    imageName: "",
    imageType: "",
    imageDataUrl: "",
    authorStudentId: "",
  });
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentAttachments, setCommentAttachments] = useState({});

  // Form Quản lý Lớp, Điểm danh nhanh, Excel & Mật khẩu GV (Mục 09)
  const [newClassForm, setNewClassForm] = useState({
    id: "",
    name: "",
    grade: "10",
    academicYear: appData.currentAcademicYear || "2026 - 2027",
    scheduleSummary: "",
  });
  const [singleStudent, setSingleStudent] = useState({
    name: "",
    classId: "10A1",
    email: "",
    password: "",
    targetScore: "8.5+",
    universityGoal: "",
  });
  const [excelBulkText, setExcelBulkText] = useState("");
  const [newTeacherPass, setNewTeacherPass] = useState("");

  const [attendanceModalClass, setAttendanceModalClass] = useState(null);
  const [attendanceEventMeta, setAttendanceEventMeta] = useState(null);
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionRecords, setSessionRecords] = useState({});
  const [sessionDocId, setSessionDocId] = useState("");
  const [sessionCustomDocTitle, setSessionCustomDocTitle] = useState("");
  const [sessionCustomDocUrl, setSessionCustomDocUrl] = useState("");

  // Điểm danh trực tiếp ngay lúc tạo lịch học (Mục 02)
  const [calFormIncludeAttendance, setCalFormIncludeAttendance] = useState(false);
  const [calFormAttendanceRecords, setCalFormAttendanceRecords] = useState({});

  // Modal Sửa thông tin Lớp học & Sửa thông tin Học sinh sau khi tạo + Sửa Tài liệu
  const [editingClassModal, setEditingClassModal] = useState(null);
  const [editingStudentModal, setEditingStudentModal] = useState(null);
  const [editingDocModal, setEditingDocModal] = useState(null);

  // ============================================================================
  // HÀM QUẢN LÝ NĂM HỌC (THÊM NĂM HỌC MỚI / ĐẶT NĂM HỌC MẶC ĐỊNH)
  // ============================================================================
  const handleAddAcademicYear = (e) => {
    e.preventDefault();
    const y = newYearInput.trim();
    if (!y) return;
    const list = appData.academicYears || DEFAULT_ACADEMIC_YEARS;
    if (list.includes(y)) {
      notify("Năm học này đã có trong danh sách!", "warn");
      return;
    }
    const nextYears = [...list, y];
    saveToAll({
      ...appData,
      academicYears: nextYears,
      currentAcademicYear: y,
    });
    setSelectedAcademicYear(y);
    setNewYearInput("");
    notify(`Đã thêm và chuyển sang Năm học ${y}!`, "success");
  };

  const handleSetDefaultAcademicYear = (y) => {
    saveToAll({
      ...appData,
      currentAcademicYear: y,
    });
    setSelectedAcademicYear(y);
    notify(`Đã đặt Năm học ${y} làm năm học chính thức hiện tại.`, "success");
  };

  // ============================================================================
  // HÀM TẢI TÀI LIỆU LÊN -> TỰ ĐỘNG CẬP NHẬT MỤC TIN TỨC (PHÂN MỤC HỌC THUẬT)
  // ============================================================================
  const createDocumentAndAutoNews = ({
    title,
    grade,
    classId,
    chapterId,
    chapterTitle,
    externalUrl,
    note,
    fileName,
    fileType,
    fileDataUrl,
  }) => {
    const activeYear =
      selectedAcademicYear === "ALL"
        ? appData.currentAcademicYear || "2026 - 2027"
        : selectedAcademicYear;

    const newDoc = {
      id: "DOC_" + Date.now(),
      title: title.trim(),
      grade: grade || "12",
      classId: classId || "ALL",
      chapterId: chapterId || "",
      chapterTitle: chapterTitle || "Tài liệu chung",
      externalUrl: (externalUrl || "").trim(),
      note: (note || "").trim(),
      fileName: fileName || "",
      fileType: fileType || "",
      fileDataUrl: fileDataUrl || "",
      academicYear: activeYear,
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    const classLabel =
      newDoc.classId === "ALL"
        ? `Khối ${newDoc.grade} (Tất cả các lớp)`
        : `Lớp ${newDoc.classId}`;

    const autoNews = {
      id: "ANN_DOC_" + Date.now(),
      title: `📚 [Tài liệu mới] ${newDoc.title} — ${classLabel}`,
      category: "ACADEMIC",
      academicYear: activeYear,
      sendMode: "BULK",
      classId: newDoc.classId,
      targetStudentId: "",
      targetLabel: classLabel,
      content: `Thầy ${TEACHER_INFO.fullName} vừa tải lên tài liệu học tập mới:\n• Tên tài liệu: ${newDoc.title}\n• Thuộc chương: ${newDoc.chapterTitle} (Khối ${newDoc.grade})\n• Áp dụng cho: ${classLabel} (Năm học ${activeYear})${
        newDoc.note ? `\n• Ghi chú hướng dẫn: ${newDoc.note}` : ""
      }\n👉 Phụ huynh và học sinh có thể tải trực tiếp bên dưới hoặc xem trong Lộ trình Chương (Mục 03) và Kho Tài liệu (Mục 05A).`,
      externalUrl: newDoc.externalUrl,
      attachmentName: newDoc.fileName,
      attachmentType: newDoc.fileType,
      attachmentDataUrl: newDoc.fileDataUrl,
      linkedDocId: newDoc.id,
      date: new Date().toLocaleString("vi-VN"),
      recipientCount: appData.students.filter(
        (s) => newDoc.classId === "ALL" || s.classId === newDoc.classId
      ).length,
    };

    saveToAll({
      ...appData,
      documents: [newDoc, ...(appData.documents || [])],
      announcements: [autoNews, ...(appData.announcements || [])],
    });

    notify(
      `Đã tải tài liệu "${newDoc.title}" lên ${classLabel} và tự động cập nhật vào Bản tin Học thuật!`,
      "success"
    );
    return newDoc;
  };

  const handleUploadChapterDocument = (e, chap) => {
    e.preventDefault();
    if (!chapterDocForm.title.trim()) return;

    createDocumentAndAutoNews({
      title: chapterDocForm.title,
      grade: selectedGradeTab,
      classId: chapterDocForm.classId,
      chapterId: chap.id,
      chapterTitle: chap.title,
      externalUrl: chapterDocForm.externalUrl,
      note: chapterDocForm.note,
      fileName: chapterDocForm.fileName,
      fileType: chapterDocForm.fileType,
      fileDataUrl: chapterDocForm.fileDataUrl,
    });

    setChapterDocForm({
      title: "",
      classId: chapterDocForm.classId,
      externalUrl: "",
      note: "",
      fileName: "",
      fileType: "",
      fileDataUrl: "",
    });
    setActiveChapterUploadId(null);
  };

  const handleUploadDocInModule05 = (e) => {
    e.preventDefault();
    if (!docForm.title.trim()) return;

    const chapList = appData.curriculum?.[docForm.grade] || [];
    const foundChap = chapList.find((c) => c.id === docForm.chapterId);

    createDocumentAndAutoNews({
      title: docForm.title,
      grade: docForm.grade,
      classId: docForm.classId,
      chapterId: docForm.chapterId,
      chapterTitle: foundChap ? foundChap.title : "Tài liệu chuyên đề",
      externalUrl: docForm.externalUrl,
      note: docForm.note,
      fileName: docForm.fileName,
      fileType: docForm.fileType,
      fileDataUrl: docForm.fileDataUrl,
    });

    setDocForm({
      ...docForm,
      title: "",
      externalUrl: "",
      note: "",
      fileName: "",
      fileType: "",
      fileDataUrl: "",
    });
  };

  // ============================================================================
  // CÁC HÀM XỬ LÝ THỜI KHÓA BIỂU LINH HOẠT THEO TUẦN & CA HỌC TỰ DO
  // ============================================================================
  const activeTimeSlots =
    appData.timeSlots && appData.timeSlots.length > 0
      ? appData.timeSlots
      : DEFAULT_TIME_SLOTS;

  const handleAddCustomTimeSlot = (e) => {
    e.preventDefault();
    const st = newSlotForm.startTime || "20:00";
    const et = newSlotForm.endTime || "21:30";
    const lbl = newSlotForm.label.trim() || `Ca học (${st} - ${et})`;
    const newSlot = {
      id: "SLOT_" + Date.now(),
      label: lbl.includes("(") ? lbl : `${lbl} (${st} - ${et})`,
      startTime: st,
      endTime: et,
    };
    const nextSlots = [...activeTimeSlots, newSlot].sort((a, b) =>
      (a.startTime || "").localeCompare(b.startTime || "")
    );
    saveToAll({
      ...appData,
      timeSlots: nextSlots,
    });
    setCalForm((prev) => ({
      ...prev,
      slotMode: "EXISTING",
      slotId: newSlot.id,
      startTime: st,
      endTime: et,
    }));
    setNewSlotForm({ label: "", startTime: "21:00", endTime: "22:00" });
    notify("Đã thêm hàng khung giờ mới vào bảng lịch!", "success");
  };

  const handleDeleteTimeSlot = (slotId) => {
    if (activeTimeSlots.length <= 1) {
      notify("Bảng lịch cần giữ lại ít nhất 1 khung giờ.", "warn");
      return;
    }
    askConfirm(
      "Bạn có chắc muốn xóa hàng Khung giờ này khỏi bảng lịch không?",
      () => {
        const nextSlots = activeTimeSlots.filter((s) => s.id !== slotId);
        saveToAll({
          ...appData,
          timeSlots: nextSlots,
        });
        notify("Đã xóa khung giờ khỏi bảng lịch.", "info");
      }
    );
  };

  const handleAddCalendarEvent = (e) => {
    e.preventDefault();
    if (!calForm.title.trim()) return;

    const isStudent = currentUser?.role === "student";
    let targetSlotId = calForm.slotId;
    let nextSlots = [...activeTimeSlots];

    const timeRangeText = `${calForm.startTime} - ${calForm.endTime}`;

    if (calForm.slotMode === "AUTO_NEW") {
      const customTitle = calForm.newSlotLabel.trim() || "Ca linh hoạt";
      const createdSlot = {
        id: "SLOT_" + Date.now(),
        label: `${customTitle} (${timeRangeText})`,
        startTime: calForm.startTime,
        endTime: calForm.endTime,
      };
      nextSlots = [...nextSlots, createdSlot].sort((a, b) =>
        (a.startTime || "").localeCompare(b.startTime || "")
      );
      targetSlotId = createdSlot.id;
    }

    const dayObj = activeWeekInfo.days.find(
      (d) => d.dayOfWeek === calForm.dayOfWeek
    );

    const activeYear =
      selectedAcademicYear === "ALL"
        ? appData.currentAcademicYear || "2026 - 2027"
        : selectedAcademicYear;

    const linkedDocObj = (appData.documents || []).find(
      (d) => d.id === calForm.attachedDocId
    );

    const newEv = {
      id: "CAL" + Date.now(),
      academicYear: activeYear,
      dayOfWeek: calForm.dayOfWeek,
      slotId: targetSlotId,
      startTime: calForm.startTime,
      endTime: calForm.endTime,
      customTime: timeRangeText,
      repeatMode: calForm.repeatMode,
      weekKey:
        calForm.repeatMode === "WEEK_ONLY" ? activeWeekInfo.weekKey : "ALL",
      exactDate: dayObj ? dayObj.fullDate : "",
      excludedWeeks: [],
      targetScope: isStudent
        ? `HS:${currentUser.studentId}`
        : calForm.targetScope,
      ownerName: isStudent
        ? `Lịch cá nhân: ${currentUser.name}`
        : calForm.targetScope === "ALL"
        ? "Toàn bộ các lớp"
        : `Lớp ${calForm.targetScope}`,
      title: calForm.title.trim(),
      roomOrNote: calForm.roomOrNote.trim(),
      attachedDocId: calForm.attachedDocId || "",
      lessonDocTitle:
        calForm.lessonDocTitle.trim() ||
        (linkedDocObj ? linkedDocObj.title : ""),
      lessonDocUrl:
        calForm.lessonDocUrl.trim() ||
        (linkedDocObj ? linkedDocObj.externalUrl : ""),
      lessonDocFileName:
        calForm.lessonDocFileName ||
        (linkedDocObj ? linkedDocObj.fileName : ""),
      lessonDocDataUrl:
        calForm.lessonDocDataUrl ||
        (linkedDocObj ? linkedDocObj.fileDataUrl : ""),
      createdByRole: currentUser?.role || "teacher",
    };

    let nextStudents = [...(appData.students || [])];
    let nextAttendanceSessions = [...(appData.attendanceSessions || [])];

    if (
      !isStudent &&
      calFormIncludeAttendance &&
      Object.keys(calFormAttendanceRecords).length > 0
    ) {
      const dateStr = new Date().toLocaleString("vi-VN");
      const sessionTopicStr = `${newEv.title} (${timeRangeText}${
        dayObj ? ` • ${dayObj.fullDate}` : ""
      })`;
      const attachedDocLabel = newEv.lessonDocTitle || "";

      nextStudents = nextStudents.map((st) => {
        const belongs =
          newEv.targetScope === "ALL" ||
          isSameClass(st.classId, newEv.targetScope);
        if (!belongs) return st;
        const rec = calFormAttendanceRecords[st.id] || {
          status: "PRESENT",
          attitude: "Chú ý nghe giảng, ghi chép bài đầy đủ",
        };
        const prevHistory = st.attendanceHistory || [];
        const scoreVal =
          rec.status === "PRESENT"
            ? 100
            : rec.status === "LATE"
            ? 85
            : rec.status === "EXCUSED"
            ? 70
            : 0;
        const statusLabel =
          rec.status === "PRESENT"
            ? "Đi học đầy đủ, đúng giờ"
            : rec.status === "LATE"
            ? "Đi học muộn"
            : rec.status === "EXCUSED"
            ? "Vắng có phép"
            : "Vắng không phép";

        const nextHistory = [
          {
            date: dateStr,
            topic: sessionTopicStr,
            attachedDocTitle: attachedDocLabel,
            status: statusLabel,
            scoreVal,
            attitude: rec.attitude,
            calendarEventId: newEv.id,
          },
          ...prevHistory,
        ];

        const avgRate = Math.round(
          nextHistory.reduce((acc, cur) => acc + Number(cur.scoreVal), 0) /
            nextHistory.length
        );

        return {
          ...st,
          attendanceRate: avgRate,
          attendanceNote: `${statusLabel} (${
            dayObj ? dayObj.fullDate : new Date().toLocaleDateString("vi-VN")
          })`,
          attitude: rec.attitude,
          attendanceHistory: nextHistory,
        };
      });

      const presentCount = Object.values(calFormAttendanceRecords).filter(
        (r) => r.status === "PRESENT" || r.status === "LATE"
      ).length;

      const newSessionLog = {
        id: "ATT" + Date.now(),
        classId: newEv.targetScope,
        calendarEventId: newEv.id,
        dateKey: dayObj ? dayObj.dateKey : toDateKey(realTimeNow),
        academicYear: activeYear,
        date: dateStr,
        topic: sessionTopicStr,
        attachedDocTitle: attachedDocLabel,
        attachedDocUrl: newEv.lessonDocUrl || "",
        totalStudents: Object.keys(calFormAttendanceRecords).length,
        presentCount,
        records: calFormAttendanceRecords,
      };
      nextAttendanceSessions = [newSessionLog, ...nextAttendanceSessions];
    }

    saveToAll({
      ...appData,
      timeSlots: nextSlots,
      calendarEvents: [...appData.calendarEvents, newEv],
      students: nextStudents,
      attendanceSessions: nextAttendanceSessions,
    });
    setCalForm({
      ...calForm,
      slotMode: "EXISTING",
      slotId: targetSlotId,
      newSlotLabel: "",
      title: "",
      roomOrNote: "",
      attachedDocId: "",
      lessonDocTitle: "",
      lessonDocUrl: "",
      lessonDocFileName: "",
      lessonDocDataUrl: "",
    });
    setCalFormIncludeAttendance(false);
    setCalFormAttendanceRecords({});
    notify(
      calFormIncludeAttendance
        ? "Đã lưu ca học mới và hoàn tất điểm danh học sinh cho buổi học!"
        : "Đã lưu ca học và tài liệu đính kèm vào Bảng lịch!",
      "success"
    );
  };

  const handleSaveEditedCalEvent = (e) => {
    e.preventDefault();
    if (!editingCalEvent) return;

    const updatedTimeRange = `${editingCalEvent.startTime || "18:00"} - ${
      editingCalEvent.endTime || "19:30"
    }`;

    const linkedDocObj = (appData.documents || []).find(
      (d) => d.id === editingCalEvent.attachedDocId
    );
    const resolvedDocTitle =
      (editingCalEvent.lessonDocTitle || "").trim() ||
      (linkedDocObj ? linkedDocObj.title : "");
    const resolvedDocUrl =
      (editingCalEvent.lessonDocUrl || "").trim() ||
      (linkedDocObj ? linkedDocObj.externalUrl : "");
    const resolvedDocFileName =
      editingCalEvent.lessonDocFileName ||
      (linkedDocObj ? linkedDocObj.fileName : "");
    const resolvedDocDataUrl =
      editingCalEvent.lessonDocDataUrl ||
      (linkedDocObj ? linkedDocObj.fileDataUrl : "");

    if (
      editingCalEvent.editScope === "THIS_WEEK_ONLY" &&
      editingCalEvent.repeatMode === "RECURRING"
    ) {
      const nextEvents = appData.calendarEvents.map((ev) => {
        if (ev.id === editingCalEvent.id) {
          const prevEx = ev.excludedWeeks || [];
          return {
            ...ev,
            excludedWeeks: prevEx.includes(activeWeekInfo.weekKey)
              ? prevEx
              : [...prevEx, activeWeekInfo.weekKey],
          };
        }
        return ev;
      });

      const overrideEv = {
        ...editingCalEvent,
        id: "CAL_OVR_" + Date.now(),
        repeatMode: "WEEK_ONLY",
        weekKey: activeWeekInfo.weekKey,
        customTime: updatedTimeRange,
        lessonDocTitle: resolvedDocTitle,
        lessonDocUrl: resolvedDocUrl,
        lessonDocFileName: resolvedDocFileName,
        lessonDocDataUrl: resolvedDocDataUrl,
      };
      delete overrideEv.editScope;

      saveToAll({
        ...appData,
        calendarEvents: [...nextEvents, overrideEv],
      });
      setEditingCalEvent(null);
      notify("Đã cập nhật lịch và tài liệu buổi học riêng cho tuần này!", "success");
      return;
    }

    const nextEvents = appData.calendarEvents.map((ev) =>
      ev.id === editingCalEvent.id
        ? {
            ...ev,
            dayOfWeek: editingCalEvent.dayOfWeek,
            slotId: editingCalEvent.slotId,
            startTime: editingCalEvent.startTime,
            endTime: editingCalEvent.endTime,
            customTime: updatedTimeRange,
            title: editingCalEvent.title,
            roomOrNote: editingCalEvent.roomOrNote,
            attachedDocId: editingCalEvent.attachedDocId || "",
            lessonDocTitle: resolvedDocTitle,
            lessonDocUrl: resolvedDocUrl,
            lessonDocFileName: resolvedDocFileName,
            lessonDocDataUrl: resolvedDocDataUrl,
            repeatMode: editingCalEvent.repeatMode,
            weekKey:
              editingCalEvent.repeatMode === "WEEK_ONLY"
                ? activeWeekInfo.weekKey
                : "ALL",
          }
        : ev
    );

    saveToAll({
      ...appData,
      calendarEvents: nextEvents,
    });
    setEditingCalEvent(null);
    notify("Đã lưu thay đổi ca học và tài liệu buổi học!", "success");
  };

  const handleCopyWeekToNextWeek = () => {
    const nextWeekInfo = getWeekDaysInfo(selectedWeekOffset + 1);
    const currentWeekOnlyEvents = appData.calendarEvents.filter(
      (ev) =>
        ev.repeatMode === "WEEK_ONLY" && ev.weekKey === activeWeekInfo.weekKey
    );
    if (currentWeekOnlyEvents.length === 0) {
      notify(
        "Các lịch cố định hàng tuần đã tự động hiển thị ở tuần sau. Đang chuyển sang tuần kế tiếp.",
        "info"
      );
      setSelectedWeekOffset((prev) => prev + 1);
      return;
    }
    const cloned = currentWeekOnlyEvents.map((ev, i) => ({
      ...ev,
      id: `CAL_CLONE_${Date.now()}_${i}`,
      weekKey: nextWeekInfo.weekKey,
    }));
    saveToAll({
      ...appData,
      calendarEvents: [...appData.calendarEvents, ...cloned],
    });
    setSelectedWeekOffset((prev) => prev + 1);
    notify(
      `Đã sao chép ${cloned.length} ca học linh hoạt sang ${nextWeekInfo.weekLabel}!`,
      "success"
    );
  };

  const getTodayMaterialsForClass = (cls) => {
    const todayInfo = activeWeekInfo.days.find((d) => d.isToday);
    const items = [];

    if (cls.todayDocIds && cls.todayDocIds.length > 0) {
      cls.todayDocIds.forEach((docId) => {
        const d = (appData.documents || []).find((x) => x.id === docId);
        if (d) {
          items.push({
            id: d.id,
            source: "Lớp học",
            title: d.title,
            url: d.externalUrl,
            fileName: d.fileName,
            dataUrl: d.fileDataUrl,
          });
        }
      });
    }
    if (cls.todayCustomDocTitle) {
      items.push({
        id: `CLS_CUSTOM_${cls.id}`,
        source: "Bài học hôm nay",
        title: cls.todayCustomDocTitle,
        url: cls.todayCustomDocUrl || "",
        fileName: cls.todayCustomDocFileName || "",
        dataUrl: cls.todayCustomDocDataUrl || "",
      });
    }

    if (todayInfo) {
      const todayClassEvents = (appData.calendarEvents || []).filter((ev) => {
        if (ev.dayOfWeek !== todayInfo.dayOfWeek) return false;
        if (ev.targetScope !== cls.id && ev.targetScope !== "ALL") return false;
        const isRec = !ev.repeatMode || ev.repeatMode === "RECURRING";
        if (isRec) {
          return !(ev.excludedWeeks || []).includes(activeWeekInfo.weekKey);
        }
        return ev.weekKey === activeWeekInfo.weekKey;
      });

      todayClassEvents.forEach((ev) => {
        if (ev.lessonDocTitle || ev.attachedDocId) {
          const linked = (appData.documents || []).find(
            (d) => d.id === ev.attachedDocId
          );
          items.push({
            id: `EV_DOC_${ev.id}`,
            source: `Ca ${ev.customTime || ""}`,
            title: ev.lessonDocTitle || linked?.title || "Tài liệu buổi học",
            url: ev.lessonDocUrl || linked?.externalUrl || "",
            fileName: ev.lessonDocFileName || linked?.fileName || "",
            dataUrl: ev.lessonDocDataUrl || linked?.fileDataUrl || "",
          });
        }
      });
    }

    return items;
  };

  const handleSaveClassTodayMaterials = (e) => {
    e.preventDefault();
    if (!editingClassDocsModal) return;

    const nextClasses = appData.classes.map((c) =>
      c.id === editingClassDocsModal.id
        ? {
            ...c,
            todayDocIds: editingClassDocsModal.todayDocIds || [],
            todayCustomDocTitle: (
              editingClassDocsModal.todayCustomDocTitle || ""
            ).trim(),
            todayCustomDocUrl: (
              editingClassDocsModal.todayCustomDocUrl || ""
            ).trim(),
            todayCustomDocFileName:
              editingClassDocsModal.todayCustomDocFileName || "",
            todayCustomDocDataUrl:
              editingClassDocsModal.todayCustomDocDataUrl || "",
          }
        : c
    );

    saveToAll({
      ...appData,
      classes: nextClasses,
    });
    setEditingClassDocsModal(null);
    notify(
      `Đã cập nhật tài liệu học hôm nay cho Lớp ${editingClassDocsModal.id}!`,
      "success"
    );
  };

  // ============================================================================
  // HÀM XỬ LÝ MỤC 10: CHUYỆN HÓA HỌC HẰNG NGÀY, BÀI BÁO GỢI MỞ & HỎI ĐÁP KIỂU FACEBOOK
  // ============================================================================
  const adjustStudentEngagementPoints = (studentId, deltaPoints) => {
    if (!studentId || studentId === "TEACHER") return;
    const nextStudents = (appData.students || []).map((st) => {
      if (st.id !== studentId) return st;
      const currentPts = Number(st.engagementPoints || 0);
      const nextPts = Math.max(0, currentPts + Number(deltaPoints || 0));
      return {
        ...st,
        engagementPoints: nextPts,
      };
    });
    saveToAll({
      ...appData,
      students: nextStudents,
    });
  };

  const handleCreateChemFeedPost = (e) => {
    e.preventDefault();
    if (!newPostForm.content.trim() && !newPostForm.title.trim()) {
      notify("Vui lòng nhập tiêu đề hoặc nội dung bài viết / câu hỏi!", "warn");
      return;
    }

    const activeYear =
      selectedAcademicYear === "ALL"
        ? appData.currentAcademicYear || "2026 - 2027"
        : selectedAcademicYear;

    let authorRole = currentUser?.role || "teacher";
    let authorId = "TEACHER";
    let authorName = `Thầy ${TEACHER_INFO.fullName}`;
    let authorClassId = newPostForm.classId || "ALL";

    if (currentUser?.role === "student") {
      authorRole = "student";
      authorId = currentUser.studentId;
      authorName = currentUser.name;
      authorClassId = currentUser.classId;
    } else if (
      newPostForm.postType === "STUDENT_QA" &&
      newPostForm.authorStudentId
    ) {
      const foundSt = (appData.students || []).find(
        (s) => s.id === newPostForm.authorStudentId
      );
      if (foundSt) {
        authorRole = "student";
        authorId = foundSt.id;
        authorName = foundSt.name;
        authorClassId = foundSt.classId;
      }
    }

    const effectiveType =
      currentUser?.role === "student" ? "STUDENT_QA" : newPostForm.postType;

    const newPost = {
      id: "POST_" + Date.now(),
      academicYear: activeYear,
      postType: effectiveType,
      grade: newPostForm.grade || "ALL",
      classId: authorClassId,
      authorId,
      authorName,
      authorRole,
      title: newPostForm.title.trim(),
      content: newPostForm.content.trim(),
      articleUrl: newPostForm.articleUrl.trim(),
      rewardPoints:
        effectiveType === "STUDENT_QA"
          ? 3
          : Number(newPostForm.rewardPoints) || 5,
      correctAnswerHint: newPostForm.correctAnswerHint.trim(),
      imageName: newPostForm.imageName,
      imageType: newPostForm.imageType,
      imageDataUrl: newPostForm.imageDataUrl,
      likes: [],
      loves: [],
      ideas: [],
      comments: [],
      isResolved: false,
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    let nextStudents = [...(appData.students || [])];
    if (authorRole === "student" && authorId !== "TEACHER") {
      nextStudents = nextStudents.map((st) =>
        st.id === authorId
          ? { ...st, engagementPoints: Number(st.engagementPoints || 0) + 2 }
          : st
      );
    }

    saveToAll({
      ...appData,
      students: nextStudents,
      chemFeedPosts: [newPost, ...(appData.chemFeedPosts || [])],
    });

    setNewPostForm({
      ...newPostForm,
      title: "",
      content: "",
      articleUrl: "",
      correctAnswerHint: "",
      imageName: "",
      imageType: "",
      imageDataUrl: "",
    });

    notify(
      effectiveType === "STUDENT_QA"
        ? "🙋‍♂️ Đã đăng câu hỏi lên Bảng tin Hóa học! Thầy và các bạn sẽ sớm vào giải đáp."
        : "📰 Đã đăng bài viết mới lên Chuyện Hóa Học Hằng Ngày!",
      "success"
    );
  };

  const handleTogglePostReaction = (postId, reactionKey) => {
    const actorId =
      currentUser?.role === "student" ? currentUser.studentId : "TEACHER";
    const nextPosts = (appData.chemFeedPosts || []).map((post) => {
      if (post.id !== postId) return post;
      const list = post[reactionKey] || [];
      const exists = list.includes(actorId);
      const nextList = exists
        ? list.filter((x) => x !== actorId)
        : [...list, actorId];
      return {
        ...post,
        [reactionKey]: nextList,
      };
    });
    saveToAll({
      ...appData,
      chemFeedPosts: nextPosts,
    });
  };

  const handleAddPostComment = (e, post) => {
    e.preventDefault();
    const draftObj = commentDrafts[post.id] || {};
    const text = (draftObj.text || "").trim();
    const attach = commentAttachments[post.id] || null;
    if (!text && !attach) return;

    let commenterId =
      currentUser?.role === "student" ? currentUser.studentId : "TEACHER";
    let commenterName =
      currentUser?.role === "student"
        ? currentUser.name
        : `Thầy ${TEACHER_INFO.fullName}`;
    let commenterRole = currentUser?.role || "teacher";
    let commenterClass =
      currentUser?.role === "student" ? currentUser.classId : "Giáo viên";

    if (currentUser?.role === "teacher" && draftObj.asStudentId) {
      const st = (appData.students || []).find(
        (s) => s.id === draftObj.asStudentId
      );
      if (st) {
        commenterId = st.id;
        commenterName = st.name;
        commenterRole = "student";
        commenterClass = st.classId;
      }
    }

    const participationBonus = commenterRole === "student" ? 1 : 0;

    const newComment = {
      id: "CMT_" + Date.now(),
      authorId: commenterId,
      authorName: commenterName,
      authorRole: commenterRole,
      authorClass: commenterClass,
      text,
      attachmentName: attach?.fileName || "",
      attachmentType: attach?.fileType || "",
      attachmentDataUrl: attach?.dataUrl || "",
      isApprovedCorrect: false,
      awardedPoints: participationBonus,
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    const nextPosts = (appData.chemFeedPosts || []).map((p) =>
      p.id === post.id
        ? { ...p, comments: [...(p.comments || []), newComment] }
        : p
    );

    let nextStudents = [...(appData.students || [])];
    if (commenterRole === "student" && commenterId !== "TEACHER") {
      nextStudents = nextStudents.map((st) =>
        st.id === commenterId
          ? {
              ...st,
              engagementPoints:
                Number(st.engagementPoints || 0) + participationBonus,
            }
          : st
      );
    }

    saveToAll({
      ...appData,
      students: nextStudents,
      chemFeedPosts: nextPosts,
    });

    setCommentDrafts((prev) => ({
      ...prev,
      [post.id]: { ...draftObj, text: "" },
    }));
    setCommentAttachments((prev) => ({
      ...prev,
      [post.id]: null,
    }));

    if (commenterRole === "student") {
      notify(
        `💬 Đã gửi bình luận! ${commenterName} nhận +1 điểm tương tác tích cực.`,
        "success"
      );
    }
  };

  const handleApproveCommentAnswer = (post, comment) => {
    const bonusPts = Number(post.rewardPoints || 5);
    const alreadyApproved = Boolean(comment.isApprovedCorrect);
    const delta = alreadyApproved ? -bonusPts : bonusPts;

    const nextPosts = (appData.chemFeedPosts || []).map((p) => {
      if (p.id !== post.id) return p;
      const updatedComments = (p.comments || []).map((c) =>
        c.id === comment.id
          ? {
              ...c,
              isApprovedCorrect: !alreadyApproved,
              awardedPoints: Math.max(0, Number(c.awardedPoints || 0) + delta),
            }
          : c
      );
      return {
        ...p,
        isResolved:
          !alreadyApproved ||
          updatedComments.some((c) => c.isApprovedCorrect),
        comments: updatedComments,
      };
    });

    let nextStudents = [...(appData.students || [])];
    if (comment.authorId && comment.authorId !== "TEACHER") {
      nextStudents = nextStudents.map((st) =>
        st.id === comment.authorId
          ? {
              ...st,
              engagementPoints: Math.max(
                0,
                Number(st.engagementPoints || 0) + delta
              ),
            }
          : st
      );
    }

    saveToAll({
      ...appData,
      students: nextStudents,
      chemFeedPosts: nextPosts,
    });

    notify(
      !alreadyApproved
        ? `🌟 Đã xác nhận Đáp án đúng / Lời giải hay! Thưởng +${bonusPts} điểm tương tác cho ${comment.authorName}.`
        : `Đã hủy xác nhận điểm thưởng của bình luận này.`,
      "success"
    );
  };

  const handleConvertEngagementToProfileScore = (student) => {
    const pts = Number(student.engagementPoints || 0);
    if (pts <= 0) {
      notify("Học sinh này chưa có điểm tương tác tích lũy để quy đổi!", "warn");
      return;
    }
    const convertedScore = Math.min(10, Number((8 + Math.min(2, pts * 0.1)).toFixed(2)));
    const recordId = `ENGAGEMENT_BONUS_${student.id}`;
    const nowStr = new Date().toLocaleDateString("vi-VN");

    const nextStudents = (appData.students || []).map((st) => {
      if (st.id !== student.id) return st;
      const prevTests = st.inClassTests || [];
      const bonusTest = {
        id: recordId,
        testName: `Điểm thưởng Tương tác Hóa học (${pts} điểm tương tác)`,
        testType: "Điểm thưởng Tương tác & Giải đáp Hóa học",
        score: convertedScore,
        maxScore: 10,
        date: nowStr,
        teacherNote: `Tích cực bình luận đáp án đúng và giải đáp câu hỏi khó trên Bảng tin Hóa học (${pts} điểm tương tác).`,
      };
      const exists = prevTests.some((t) => t.id === recordId);
      const updatedTests = exists
        ? prevTests.map((t) => (t.id === recordId ? bonusTest : t))
        : [bonusTest, ...prevTests];

      const allScores = [
        ...updatedTests.map((t) => Number(t.score)),
        ...(st.scoreHistory || []).map((h) => Number(h.score)),
      ];
      const newAvg =
        allScores.length > 0
          ? Number(
              (
                allScores.reduce((a, b) => a + b, 0) / allScores.length
              ).toFixed(2)
            )
          : convertedScore;

      return {
        ...st,
        inClassTests: updatedTests,
        score: newAvg,
      };
    });

    saveToAll({
      ...appData,
      students: nextStudents,
    });

    notify(
      `🏆 Đã cập nhật Điểm thưởng Tương tác (${convertedScore}/10) vào Hồ sơ học tập (Mục 04) của HS ${student.name}!`,
      "success"
    );
  };

  const createDefaultRoadmap = (gradeStr) => {
    const chaps =
      appData.curriculum?.[gradeStr] || DEFAULT_CURRICULUM[gradeStr] || [];
    const map = {};
    chaps.forEach((c) => {
      map[c.id] = 0;
    });
    return map;
  };

  const updateStudentField = (studentId, updates) => {
    const nextStudents = appData.students.map((s) =>
      s.id === studentId ? { ...s, ...updates } : s
    );
    saveToAll({ ...appData, students: nextStudents });
  };

  const handleCreatePersonalFlashcard = (e) => {
    e.preventDefault();
    if (!newFlashcardForm.front.trim() || !newFlashcardForm.back.trim()) return;

    const ownerId =
      currentUser.role === "student" ? currentUser.studentId : "TEACHER";
    const ownerName = currentUser.name;

    const newCard = {
      id: "FC" + Date.now(),
      ownerId,
      ownerName,
      grade: newFlashcardForm.grade,
      topic: newFlashcardForm.topic.trim() || "Ghi nhớ cá nhân",
      front: newFlashcardForm.front.trim(),
      back: newFlashcardForm.back.trim(),
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    saveToAll({
      ...appData,
      customFlashcards: [newCard, ...(appData.customFlashcards || [])],
    });

    setNewFlashcardForm({
      ...newFlashcardForm,
      topic: "",
      front: "",
      back: "",
    });
    setFlashcardSource("PERSONAL");
    setCardIndex(0);
    setIsCardFlipped(false);
    notify("Đã lưu thẻ vào Bộ Flashcard cá nhân!", "success");
  };

  const handleAssignHomeworkAndEmail = (e) => {
    e.preventDefault();
    if (!hwForm.title.trim()) return;

    let recipients = [];
    let targetLabel = "";

    if (hwForm.sendMode === "INDIVIDUAL") {
      const targetSt =
        appData.students.find((s) => s.id === hwForm.targetStudentId) ||
        activeStudent;
      if (!targetSt) {
        notify("Vui lòng chọn 1 Học sinh cụ thể để gửi bài tập!", "warn");
        return;
      }
      recipients = [targetSt];
      targetLabel = `HS ${targetSt.name} (Lớp ${targetSt.classId})`;
    } else {
      recipients =
        hwForm.classId === "ALL"
          ? appData.students
          : appData.students.filter((s) => s.classId === hwForm.classId);
      targetLabel =
        hwForm.classId === "ALL"
          ? "Toàn bộ các lớp"
          : `Lớp ${hwForm.classId}`;
    }

    const portalUrl =
      hwForm.submissionPortalLink.trim() ||
      (typeof window !== "undefined" ? window.location.href : "");

    const activeYear =
      selectedAcademicYear === "ALL"
        ? appData.currentAcademicYear || "2026 - 2027"
        : selectedAcademicYear;

    const formattedDeadlineLabel = hwForm.deadlineISO
      ? new Date(hwForm.deadlineISO).toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

    const newHw = {
      id: "HW" + Date.now(),
      academicYear: activeYear,
      title: hwForm.title.trim(),
      sendMode: hwForm.sendMode,
      classId: hwForm.classId,
      targetStudentId:
        hwForm.sendMode === "INDIVIDUAL"
          ? hwForm.targetStudentId || activeStudent?.id
          : "",
      targetLabel,
      dueDate:
        hwForm.dueDate.trim() ||
        formattedDeadlineLabel ||
        "Trước buổi học tiếp theo",
      deadlineISO: hwForm.deadlineISO || "",
      description: hwForm.description.trim(),
      fileUrl: hwForm.fileUrl.trim(),
      submissionPortalLink: portalUrl,
      fileName: hwForm.fileName,
      fileType: hwForm.fileType,
      fileDataUrl: hwForm.fileDataUrl,
      completedBy: [],
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    const autoHomeworkNews = {
      id: "ANN_HW_" + Date.now(),
      title: `⏰ [Bài tập mới & Hạn nộp] ${newHw.title} — ${targetLabel}`,
      category: "HOMEWORK_DEADLINE",
      academicYear: activeYear,
      sendMode: hwForm.sendMode,
      classId: hwForm.classId,
      targetStudentId: newHw.targetStudentId,
      targetLabel,
      content: `Thầy ${TEACHER_INFO.fullName} vừa đăng bài tập mới:
• Bài tập: ${newHw.title}
• Đối tượng: ${targetLabel}
• ⏰ Hạn chót hoàn thành (Deadline): ${newHw.dueDate}${
        newHw.deadlineISO
          ? " (Tới giờ hạn chót, hệ thống sẽ tự động khóa link nộp bài)"
          : ""
      }
• Hướng dẫn / Yêu cầu: ${
        newHw.description || "Hoàn thành đầy đủ và nộp đúng thời hạn tại Mục 05B."
      }`,
      externalUrl: newHw.fileUrl,
      attachmentName: newHw.fileName,
      attachmentType: newHw.fileType,
      attachmentDataUrl: newHw.fileDataUrl,
      linkedHomeworkId: newHw.id,
      date: new Date().toLocaleString("vi-VN"),
      recipientCount: recipients.length,
    };

    saveToAll({
      ...appData,
      homeworks: [newHw, ...(appData.homeworks || [])],
      announcements: [autoHomeworkNews, ...(appData.announcements || [])],
    });

    if (hwForm.sendEmailNow) {
      const emailList = recipients.map((r) => r.email).filter(Boolean);
      const subject = `[Bài tập Hóa học - ${targetLabel}] ${newHw.title} (Hạn nộp: ${newHw.dueDate})`;
      const greeting =
        hwForm.sendMode === "INDIVIDUAL" && recipients[0]
          ? `Kính gửi Quý Phụ huynh và Học sinh ${recipients[0].name} (Lớp ${recipients[0].classId}),`
          : `Kính gửi Quý Phụ huynh và các em Học sinh (${targetLabel}),`;

      const body = `${greeting}

Thầy Dương Anh Tuấn Anh (${TEACHER_INFO.subNote}) giao nhiệm vụ Bài tập về nhà mới như sau:

1. THÔNG TIN BÀI TẬP:
- Tên bài tập: ${newHw.title}
- Đối tượng: ${targetLabel}
- Năm học: ${activeYear}
- Hạn chót hoàn thành (Deadline): ${newHw.dueDate}
- Yêu cầu / Hướng dẫn chi tiết: ${
        newHw.description || "Hoàn thành đầy đủ vào vở hoặc phiếu bài tập."
      }

2. FILE BÀI TẬP ĐÍNH KÈM:
${
  newHw.fileUrl
    ? `- Đường link tải trực tiếp File Bài tập: ${newHw.fileUrl}`
    : newHw.fileName
    ? `- File bài tập "${newHw.fileName}" đã được đăng tải sẵn tại Mục 05B trên Website lớp học.`
    : "- Đề bài chi tiết đã được cập nhật tại Mục 05B trên Website lớp học."
}

3. ĐƯỜNG LINK TRUY CẬP NƠI NỘP BÀI TẬP:
- Sau khi làm bài xong, Học sinh truy cập vào đường link dưới đây (vào Mục 05B -> Khu vực Nộp Bài Tập) để gửi ảnh chụp bài làm hoặc file bài nộp lên hệ thống:
👉 Link nơi nộp bài: ${portalUrl}

Trân trọng,
Thầy Dương Anh Tuấn Anh (${TEACHER_INFO.subNote})
Email: ${TEACHER_INFO.email}`;

      if (hwForm.sendMode === "INDIVIDUAL" && emailList.length > 0) {
        setEmailPreviewModal({
          modeBadge: "Gửi cá nhân từng HS/PH",
          to: emailList[0],
          subject,
          body,
          mailtoUrl: `mailto:${encodeURIComponent(
            emailList[0]
          )}?cc=${encodeURIComponent(
            TEACHER_INFO.email
          )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
            body
          )}`,
        });
      } else {
        const bcc = emailList.join(",");
        setEmailPreviewModal({
          modeBadge: `Gửi hàng loạt (${emailList.length} PH/HS)`,
          to: bcc || TEACHER_INFO.email,
          subject,
          body,
          mailtoUrl: `mailto:${encodeURIComponent(
            TEACHER_INFO.email
          )}?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(
            subject
          )}&body=${encodeURIComponent(body)}`,
        });
      }
    }

    setHwForm({
      ...hwForm,
      title: "",
      dueDate: "",
      deadlineISO: "",
      description: "",
      fileUrl: "",
      fileName: "",
      fileType: "",
      fileDataUrl: "",
    });
    notify("Đã giao bài tập mới thành công!", "success");
  };

  const handleGradeHomeworkAndSyncProfile = (hwOrSub, student = null, existingSub = null) => {
    if (hwOrSub && !student && hwOrSub.homeworkId) {
      const subObj = hwOrSub;
      const foundHw = (appData.homeworks || []).find((h) => h.id === subObj.homeworkId) || { id: subObj.homeworkId, title: subObj.homeworkTitle || "Bài tập" };
      const foundSt = (appData.students || []).find((s) => s.id === subObj.studentId) || { id: subObj.studentId, name: subObj.studentName, classId: subObj.classId };
      hwOrSub = foundHw;
      student = foundSt;
      existingSub = subObj;
    }
    const hw = hwOrSub;
    const key = existingSub ? existingSub.id : `${hw.id}_${student.id}`;
    const inputObj = gradingInputs[key] || {};
    const rawScore =
      inputObj.score !== undefined
        ? inputObj.score
        : existingSub?.gradeScore ?? "";
    const feedback =
      inputObj.feedback !== undefined
        ? inputObj.feedback
        : existingSub?.teacherFeedback ?? "";

    const parsedScore = parseFloat(rawScore);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10) {
      notify("Vui lòng nhập điểm số hợp lệ (từ 0 đến 10) để chấm và lưu vào hồ sơ!", "warn");
      return;
    }

    const nowStr = new Date().toLocaleDateString("vi-VN");
    const subId = existingSub ? existingSub.id : `HWSUB_TEACHER_${hw.id}_${student.id}`;

    let nextSubmissions = [...(appData.homeworkSubmissions || [])];
    if (existingSub) {
      nextSubmissions = nextSubmissions.map((sub) =>
        sub.id === existingSub.id
          ? {
              ...sub,
              gradeScore: parsedScore,
              teacherFeedback: feedback.trim(),
              gradedAt: new Date().toLocaleString("vi-VN"),
              isSyncedToProfile: true,
            }
          : sub
      );
    } else {
      nextSubmissions = [
        {
          id: subId,
          homeworkId: hw.id,
          homeworkTitle: hw.title,
          studentId: student.id,
          studentName: student.name,
          classId: student.classId,
          studentNote: "Giáo viên chấm trực tiếp",
          fileName: "",
          fileType: "",
          fileDataUrl: "",
          gradeScore: parsedScore,
          teacherFeedback: feedback.trim(),
          submittedAt: new Date().toLocaleString("vi-VN"),
          gradedAt: new Date().toLocaleString("vi-VN"),
          isSyncedToProfile: true,
        },
        ...nextSubmissions,
      ];
    }

    const nextHomeworks = (appData.homeworks || []).map((item) => {
      if (item.id === hw.id) {
        const done = item.completedBy || [];
        return {
          ...item,
          completedBy: done.includes(student.id) ? done : [...done, student.id],
        };
      }
      return item;
    });

    const profileTestId = `HW_PROFILE_${hw.id}_${student.id}`;
    const nextStudents = (appData.students || []).map((st) => {
      if (st.id !== student.id) return st;

      const prevTests = st.inClassTests || [];
      const testRecord = {
        id: profileTestId,
        testName: `[Bài tập] ${hw.title}`,
        testType: "Bài tập về nhà / Đánh giá thường xuyên",
        score: parsedScore,
        maxScore: 10,
        date: nowStr,
        teacherNote:
          feedback.trim() || "Đã chấm bài tập và đồng bộ vào hồ sơ học tập.",
      };

      const existsInProfile = prevTests.some((t) => t.id === profileTestId);
      const updatedTests = existsInProfile
        ? prevTests.map((t) => (t.id === profileTestId ? testRecord : t))
        : [testRecord, ...prevTests];

      const allScores = [
        ...updatedTests.map((t) => Number(t.score)),
        ...(st.scoreHistory || []).map((h) => Number(h.score)),
      ];
      const newAvg =
        allScores.length > 0
          ? Number(
              (
                allScores.reduce((a, b) => a + b, 0) / allScores.length
              ).toFixed(2)
            )
          : parsedScore;

      return {
        ...st,
        inClassTests: updatedTests,
        score: newAvg,
      };
    });

    saveToAll({
      ...appData,
      homeworks: nextHomeworks,
      homeworkSubmissions: nextSubmissions,
      students: nextStudents,
    });

    notify(
      `💯 Đã chấm ${parsedScore}/10 điểm bài "${hw.title}" cho HS ${student.name} và tự động nhập vào Hồ sơ học tập (Mục 04)!`,
      "success"
    );
  };

  const handleDeleteHomework = (hw) => {
    askConfirm(
      `Bạn có chắc chắn muốn xóa bài tập "${hw.title}" khỏi danh sách đã giao không?`,
      () => {
        const nextHomeworks = (appData.homeworks || []).filter(
          (item) => item.id !== hw.id
        );
        const nextSubmissions = (appData.homeworkSubmissions || []).filter(
          (sub) => sub.homeworkId !== hw.id
        );
        saveToAll({
          ...appData,
          homeworks: nextHomeworks,
          homeworkSubmissions: nextSubmissions,
        });
        if (hwSubForm.homeworkId === hw.id) {
          setHwSubForm((prev) => ({ ...prev, homeworkId: "" }));
        }
        notify(`Đã xóa bài tập "${hw.title}".`, "info");
      }
    );
  };

  const handleSubmitHomeworkWork = (e) => {
    e.preventDefault();
    if (!hwSubForm.homeworkId) {
      notify("Vui lòng chọn bài tập cần nộp!", "warn");
      return;
    }
    const hwObj = (appData.homeworks || []).find(
      (h) => h.id === hwSubForm.homeworkId
    );
    const deadlineCheck = getHomeworkDeadlineStatus(hwObj, realTimeNow);
    if (deadlineCheck.isExpired) {
      notify(
        "⛔ Đã quá thời gian hoàn thành bài tập! Link nộp bài tập này đã tự động khóa.",
        "error"
      );
      return;
    }

    let submitterStudent = null;
    if (currentUser?.role === "student") {
      submitterStudent =
        appData.students.find((s) => s.id === currentUser.studentId) || {
          id: currentUser.studentId,
          name: currentUser.name,
          classId: currentUser.classId,
        };
    } else {
      const pickedId = hwSubForm.studentId || activeStudent?.id || "";
      submitterStudent = appData.students.find((s) => s.id === pickedId);
      if (!submitterStudent && hwSubForm.studentNameCustom.trim()) {
        submitterStudent = {
          id: "HS_CUSTOM_" + Date.now(),
          name: hwSubForm.studentNameCustom.trim(),
          classId:
            hwSubForm.studentClassCustom.trim().toUpperCase() ||
            (hwObj && hwObj.classId !== "ALL" ? hwObj.classId : "") ||
            appData.classes[0]?.id ||
            "CHUNG",
        };
      }
    }

    if (!submitterStudent) {
      notify(
        "Vui lòng chọn Học sinh nộp bài (hoặc nhập Họ tên Học sinh) trước khi bấm Nộp bài!",
        "warn"
      );
      return;
    }

    const newSub = {
      id: "HWSUB" + Date.now(),
      homeworkId: hwSubForm.homeworkId,
      homeworkTitle: hwObj ? hwObj.title : "Bài tập về nhà",
      studentId: submitterStudent.id,
      studentName: submitterStudent.name,
      classId: submitterStudent.classId,
      studentNote: hwSubForm.studentNote.trim(),
      fileName: hwSubForm.fileName,
      fileType: hwSubForm.fileType,
      fileDataUrl: hwSubForm.fileDataUrl,
      teacherFeedback: "",
      gradeScore: "",
      submittedAt: new Date().toLocaleString("vi-VN"),
    };

    const nextHomeworks = (appData.homeworks || []).map((h) => {
      if (h.id === hwSubForm.homeworkId) {
        const prevDone = h.completedBy || [];
        return {
          ...h,
          completedBy: prevDone.includes(submitterStudent.id)
            ? prevDone
            : [...prevDone, submitterStudent.id],
        };
      }
      return h;
    });

    saveToAll({
      ...appData,
      homeworks: nextHomeworks,
      homeworkSubmissions: [newSub, ...(appData.homeworkSubmissions || [])],
    });

    setHwSubForm({
      homeworkId: hwSubForm.homeworkId,
      studentId: hwSubForm.studentId,
      studentNameCustom: "",
      studentClassCustom: "",
      studentNote: "",
      fileName: "",
      fileType: "",
      fileDataUrl: "",
    });
    notify(
      `✅ Đã nộp bài tập "${newSub.homeworkTitle}" của HS ${submitterStudent.name} lên hệ thống! Giáo viên có thể xem ngay bên dưới.`,
      "success"
    );
  };

  const handleDeleteClass = (clsOrId) => {
    const cls = typeof clsOrId === "string" ? (appData.classes.find((c) => c.id === clsOrId) || { id: clsOrId, name: clsOrId }) : clsOrId;
    const count = appData.students.filter((s) => s.id && s.classId === cls.id)
      .length;
    const msg =
      count > 0
        ? `Lớp ${cls.id} (${cls.name}) hiện đang có ${count} học sinh. Bạn có chắc chắn muốn xóa lớp này không?`
        : `Bạn có chắc chắn muốn xóa Lớp ${cls.id} (${cls.name}) không?`;

    askConfirm(msg, () => {
      const nextClasses = appData.classes.filter((c) => c.id !== cls.id);
      const nextStudents =
        count > 0
          ? appData.students.filter((s) => s.classId !== cls.id)
          : appData.students;

      saveToAll({
        ...appData,
        classes: nextClasses,
        students: nextStudents,
      });
      if (selectedClassFilter === cls.id) {
        setSelectedClassFilter("ALL");
      }
      notify(`Đã xóa Lớp ${cls.id}.`, "info");
    });
  };

  const openQuickAttendance = (cls, eventMeta = null) => {
    const classStudents =
      cls.id === "ALL"
        ? appData.students || []
        : getStudentsOfClass(cls.id);
    if (classStudents.length === 0) {
      notify(
        cls.id === "ALL"
          ? "Hệ thống hiện chưa có học sinh nào. Vui lòng thêm học sinh vào lớp trước khi điểm danh."
          : `Lớp ${cls.id} hiện chưa có học sinh nào. Vui lòng thêm học sinh vào lớp trước khi điểm danh.`,
        "warn"
      );
      return;
    }

    const existingSession = eventMeta?.eventId
      ? (appData.attendanceSessions || []).find(
          (s) =>
            s.calendarEventId === eventMeta.eventId &&
            (!eventMeta.dateKey || s.dateKey === eventMeta.dateKey)
        )
      : null;

    const initRec = {};
    classStudents.forEach((st) => {
      if (existingSession?.records && existingSession.records[st.id]) {
        initRec[st.id] = existingSession.records[st.id];
      } else {
        initRec[st.id] = {
          status: "PRESENT",
          attitude: "Chú ý nghe giảng, ghi chép bài đầy đủ",
        };
      }
    });
    setSessionRecords(initRec);
    setSessionTopic(
      eventMeta?.topic ||
        existingSession?.topic ||
        `Buổi học ngày ${new Date().toLocaleDateString("vi-VN")}`
    );
    setSessionDocId(
      eventMeta?.attachedDocId !== undefined
        ? eventMeta.attachedDocId
        : cls.todayDocIds?.[0] || ""
    );
    setSessionCustomDocTitle(
      eventMeta?.lessonDocTitle !== undefined
        ? eventMeta.lessonDocTitle
        : cls.todayCustomDocTitle || ""
    );
    setSessionCustomDocUrl(
      eventMeta?.lessonDocUrl !== undefined
        ? eventMeta.lessonDocUrl
        : cls.todayCustomDocUrl || ""
    );
    setAttendanceEventMeta(eventMeta);
    setAttendanceModalClass(cls);
  };

  const openAttendanceFromCalendarEvent = (ev, dayObj = null) => {
    const scope = ev.targetScope || "ALL";
    if (scope.startsWith("HS:")) {
      notify("Đây là lịch tự học cá nhân của học sinh.", "info");
      return;
    }
    const foundCls =
      scope === "ALL"
        ? {
            id: "ALL",
            name: "Tất cả các lớp",
            academicYear: ev.academicYear || appData.currentAcademicYear,
            todayDocIds: [],
          }
        : (appData.classes || []).find((c) => isSameClass(c.id, scope)) || {
            id: scope,
            name: `Lớp ${scope}`,
            academicYear: ev.academicYear || appData.currentAcademicYear,
            todayDocIds: [],
          };

    const dateLabel = dayObj
      ? `${dayObj.dayOfWeek} (${dayObj.fullDate})`
      : ev.dayOfWeek || new Date().toLocaleDateString("vi-VN");
    const timeLabel = ev.customTime || `${ev.startTime || ""} - ${ev.endTime || ""}`;

    openQuickAttendance(foundCls, {
      eventId: ev.id,
      dateKey: dayObj ? dayObj.dateKey : toDateKey(realTimeNow),
      fullDate: dayObj ? dayObj.fullDate : new Date().toLocaleDateString("vi-VN"),
      dayOfWeek: dayObj ? dayObj.dayOfWeek : ev.dayOfWeek,
      timeLabel,
      topic: `${ev.title} (${timeLabel} • ${dateLabel})`,
      attachedDocId: ev.attachedDocId || "",
      lessonDocTitle: ev.lessonDocTitle || "",
      lessonDocUrl: ev.lessonDocUrl || "",
    });
  };

  const handleSaveAttendanceSession = (e) => {
    e.preventDefault();
    if (!attendanceModalClass) return;

    const dateStr = new Date().toLocaleString("vi-VN");
    const shortDateStr =
      attendanceEventMeta?.fullDate || new Date().toLocaleDateString("vi-VN");
    const linkedDoc = (appData.documents || []).find(
      (d) => d.id === sessionDocId
    );
    const attachedDocLabel =
      sessionCustomDocTitle.trim() || (linkedDoc ? linkedDoc.title : "");

    const nextStudents = appData.students.map((st) => {
      const belongs =
        attendanceModalClass.id === "ALL" ||
        isSameClass(st.classId, attendanceModalClass.id);
      if (!belongs) return st;
      const rec = sessionRecords[st.id];
      if (!rec) return st;

      const prevHistory = st.attendanceHistory || [];
      const scoreVal =
        rec.status === "PRESENT"
          ? 100
          : rec.status === "LATE"
          ? 85
          : rec.status === "EXCUSED"
          ? 70
          : 0;
      const statusLabel =
        rec.status === "PRESENT"
          ? "Đi học đầy đủ, đúng giờ"
          : rec.status === "LATE"
          ? "Đi học muộn"
          : rec.status === "EXCUSED"
          ? "Vắng có phép"
          : "Vắng không phép";

      const filteredPrevHistory =
        attendanceEventMeta?.eventId
          ? prevHistory.filter(
              (h) =>
                !(
                  h.calendarEventId === attendanceEventMeta.eventId &&
                  h.dateKey === attendanceEventMeta.dateKey
                )
            )
          : prevHistory;

      const nextHistory = [
        {
          date: dateStr,
          dateKey: attendanceEventMeta?.dateKey || toDateKey(realTimeNow),
          calendarEventId: attendanceEventMeta?.eventId || "",
          topic: sessionTopic,
          attachedDocTitle: attachedDocLabel,
          status: statusLabel,
          scoreVal,
          attitude: rec.attitude,
        },
        ...filteredPrevHistory,
      ];

      const avgRate = Math.round(
        nextHistory.reduce((acc, cur) => acc + Number(cur.scoreVal), 0) /
          nextHistory.length
      );

      return {
        ...st,
        attendanceRate: avgRate,
        attendanceNote: `${statusLabel} (${shortDateStr})`,
        attitude: rec.attitude,
        attendanceHistory: nextHistory,
      };
    });

    const nextClasses = appData.classes.map((c) =>
      isSameClass(c.id, attendanceModalClass.id)
        ? {
            ...c,
            todayDocIds: sessionDocId ? [sessionDocId] : c.todayDocIds || [],
            todayCustomDocTitle:
              sessionCustomDocTitle.trim() || c.todayCustomDocTitle || "",
            todayCustomDocUrl:
              sessionCustomDocUrl.trim() || c.todayCustomDocUrl || "",
          }
        : c
    );

    const presentCount = Object.values(sessionRecords).filter(
      (r) => r.status === "PRESENT" || r.status === "LATE"
    ).length;

    const newSessionLog = {
      id: "ATT" + Date.now(),
      classId: attendanceModalClass.id,
      calendarEventId: attendanceEventMeta?.eventId || "",
      dateKey: attendanceEventMeta?.dateKey || toDateKey(realTimeNow),
      academicYear:
        attendanceModalClass.academicYear ||
        appData.currentAcademicYear ||
        "2026 - 2027",
      date: dateStr,
      topic: sessionTopic,
      attachedDocTitle: attachedDocLabel,
      attachedDocUrl:
        sessionCustomDocUrl.trim() || (linkedDoc ? linkedDoc.externalUrl : ""),
      totalStudents: Object.keys(sessionRecords).length,
      presentCount,
      records: sessionRecords,
    };

    const prevSessions = (appData.attendanceSessions || []).filter((s) =>
      attendanceEventMeta?.eventId
        ? !(
            s.calendarEventId === attendanceEventMeta.eventId &&
            s.dateKey === attendanceEventMeta.dateKey
          )
        : true
    );

    saveToAll({
      ...appData,
      classes: nextClasses,
      students: nextStudents,
      attendanceSessions: [newSessionLog, ...prevSessions],
    });
    setAttendanceModalClass(null);
    setAttendanceEventMeta(null);
    notify(
      `✅ Đã lưu điểm danh (${presentCount}/${Object.keys(sessionRecords).length} HS có mặt) cho ${
        attendanceModalClass.id === "ALL"
          ? "Toàn bộ các lớp"
          : `Lớp ${attendanceModalClass.id}`
      }!`,
      "success"
    );
  };

  const handleSaveEditedClass = (e) => {
    e.preventDefault();
    if (!editingClassModal) return;
    const origId = editingClassModal.originalId;
    const newId = (editingClassModal.id || "").trim().toUpperCase();
    const newName = (editingClassModal.name || "").trim();
    const newGrade = editingClassModal.grade || "12";
    const newYear =
      editingClassModal.academicYear ||
      appData.currentAcademicYear ||
      "2026 - 2027";
    const newSchedule =
      (editingClassModal.scheduleSummary || "").trim() || "Theo Thời khóa biểu";

    if (!newId || !newName) {
      notify("Vui lòng nhập đầy đủ Mã lớp và Tên lớp!", "warn");
      return;
    }

    if (
      !isSameClass(origId, newId) &&
      (appData.classes || []).some((c) => isSameClass(c.id, newId))
    ) {
      notify(`Mã lớp ${newId} đã tồn tại! Vui lòng chọn mã lớp khác.`, "warn");
      return;
    }

    const nextClasses = (appData.classes || []).map((c) =>
      isSameClass(c.id, origId)
        ? {
            ...c,
            id: newId,
            name: newName,
            grade: newGrade,
            academicYear: newYear,
            scheduleSummary: newSchedule,
          }
        : c
    );

    const nextStudents = (appData.students || []).map((s) =>
      isSameClass(s.classId, origId)
        ? {
            ...s,
            classId: newId,
            grade: newGrade,
            academicYear: newYear,
          }
        : s
    );

    const nextCalEvents = (appData.calendarEvents || []).map((ev) =>
      isSameClass(ev.targetScope, origId)
        ? {
            ...ev,
            targetScope: newId,
            ownerName: `Lớp ${newId}`,
          }
        : ev
    );

    const nextDocs = (appData.documents || []).map((d) =>
      isSameClass(d.classId, origId)
        ? { ...d, classId: newId, grade: newGrade }
        : d
    );

    const nextHomeworks = (appData.homeworks || []).map((h) =>
      isSameClass(h.classId, origId)
        ? {
            ...h,
            classId: newId,
            targetLabel:
              h.sendMode === "BULK" ? `Lớp ${newId}` : h.targetLabel,
          }
        : h
    );

    const nextHwSubs = (appData.homeworkSubmissions || []).map((sub) =>
      isSameClass(sub.classId, origId) ? { ...sub, classId: newId } : sub
    );

    const nextExams = (appData.examPapers || []).map((ex) =>
      isSameClass(ex.classId, origId) ? { ...ex, classId: newId } : ex
    );

    const nextAch = (appData.achievements || []).map((a) =>
      isSameClass(a.classId, origId) ? { ...a, classId: newId } : a
    );

    const nextAtt = (appData.attendanceSessions || []).map((att) =>
      isSameClass(att.classId, origId) ? { ...att, classId: newId } : att
    );

    const nextAnn = (appData.announcements || []).map((ann) =>
      isSameClass(ann.classId, origId) ? { ...ann, classId: newId } : ann
    );

    const nextPosts = (appData.chemFeedPosts || []).map((p) =>
      isSameClass(p.classId, origId) ? { ...p, classId: newId } : p
    );

    saveToAll({
      ...appData,
      classes: nextClasses,
      students: nextStudents,
      calendarEvents: nextCalEvents,
      documents: nextDocs,
      homeworks: nextHomeworks,
      homeworkSubmissions: nextHwSubs,
      examPapers: nextExams,
      achievements: nextAch,
      attendanceSessions: nextAtt,
      announcements: nextAnn,
      chemFeedPosts: nextPosts,
    });

    if (isSameClass(selectedClassFilter, origId)) {
      setSelectedClassFilter(newId);
    }
    if (isSameClass(rosterFilterClass, origId)) {
      setRosterFilterClass(newId);
    }
    if (isSameClass(calendarFilterClass, origId)) {
      setCalendarFilterClass(newId);
    }

    setEditingClassModal(null);
    notify(`✅ Đã cập nhật thông tin Lớp ${newId} (${newName}) thành công!`, "success");
  };

  const handleSaveEditedStudent = (e) => {
    e.preventDefault();
    if (!editingStudentModal) return;

    const origId = editingStudentModal.originalId;
    const newId = (editingStudentModal.id || "").trim();
    const newName = (editingStudentModal.name || "").trim();
    const newClassId = (editingStudentModal.classId || "")
      .trim()
      .toUpperCase();

    if (!newId || !newName || !newClassId) {
      notify("Vui lòng nhập đầy đủ Mã HS, Họ tên và Lớp học!", "warn");
      return;
    }

    if (
      newId.toLowerCase() !== origId.toLowerCase() &&
      (appData.students || []).some(
        (s) => s.id.toLowerCase() === newId.toLowerCase()
      )
    ) {
      notify(`Mã học sinh "${newId}" đã tồn tại! Vui lòng nhập mã khác.`, "warn");
      return;
    }

    let nextClasses = [...(appData.classes || [])];
    let targetCls = nextClasses.find((c) => isSameClass(c.id, newClassId));
    const resolvedYear =
      editingStudentModal.academicYear ||
      targetCls?.academicYear ||
      appData.currentAcademicYear ||
      "2026 - 2027";

    if (!targetCls) {
      let detectedGrade = editingStudentModal.grade || "12";
      if (newClassId.startsWith("10")) detectedGrade = "10";
      else if (newClassId.startsWith("11")) detectedGrade = "11";
      else if (newClassId.startsWith("12")) detectedGrade = "12";
      targetCls = {
        id: newClassId,
        isUserCreated: true,
        name: `Lớp Hóa ${newClassId}`,
        grade: detectedGrade,
        academicYear: resolvedYear,
        scheduleSummary: "Theo Thời khóa biểu",
        todayDocIds: [],
      };
      nextClasses.push(targetCls);
    }

    const resolvedGrade =
      editingStudentModal.grade || targetCls.grade || "12";
    const parsedScore =
      editingStudentModal.score !== "" && editingStudentModal.score !== undefined
        ? Number(editingStudentModal.score)
        : 0;
    const parsedAttRate =
      editingStudentModal.attendanceRate !== "" &&
      editingStudentModal.attendanceRate !== undefined
        ? Math.min(100, Math.max(0, Number(editingStudentModal.attendanceRate)))
        : 100;

    const nextStudents = (appData.students || []).map((s) =>
      s.id === origId
        ? {
            ...s,
            id: newId,
            name: newName,
            classId: targetCls.id,
            grade: resolvedGrade,
            academicYear: resolvedYear,
            email:
              (editingStudentModal.email || "").trim() ||
              `${newName.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
            password: (editingStudentModal.password || "").trim() || "123456",
            targetScore: (editingStudentModal.targetScore || "").trim() || "8.5+",
            universityGoal: (editingStudentModal.universityGoal || "").trim(),
            score: isNaN(parsedScore) ? s.score : parsedScore,
            attendanceRate: isNaN(parsedAttRate)
              ? s.attendanceRate
              : parsedAttRate,
            attendanceNote:
              (editingStudentModal.attendanceNote || "").trim() ||
              "Đi học đầy đủ",
            attitude:
              (editingStudentModal.attitude || "").trim() ||
              "Tập trung chú ý bài giảng",
            teacherComment:
              (editingStudentModal.teacherComment || "").trim() ||
              s.teacherComment,
          }
        : s
    );

    const nextHwSubs = (appData.homeworkSubmissions || []).map((sub) =>
      sub.studentId === origId
        ? {
            ...sub,
            studentId: newId,
            studentName: newName,
            classId: targetCls.id,
          }
        : sub
    );

    const nextHomeworks = (appData.homeworks || []).map((hw) => ({
      ...hw,
      targetStudentId:
        hw.targetStudentId === origId ? newId : hw.targetStudentId,
      completedBy: (hw.completedBy || []).map((cid) =>
        cid === origId ? newId : cid
      ),
    }));

    const nextCalEvents = (appData.calendarEvents || []).map((ev) =>
      ev.targetScope === `HS:${origId}`
        ? {
            ...ev,
            targetScope: `HS:${newId}`,
            ownerName: `Lịch cá nhân: ${newName}`,
          }
        : ev
    );

    saveToAll({
      ...appData,
      classes: nextClasses,
      students: nextStudents,
      homeworkSubmissions: nextHwSubs,
      homeworks: nextHomeworks,
      calendarEvents: nextCalEvents,
    });

    if (selectedStudentId === origId) {
      setSelectedStudentId(newId);
    }
    setEditingStudentModal(null);
    notify(
      `✅ Đã cập nhật thông tin Học sinh ${newName} (Lớp ${targetCls.id})!`,
      "success"
    );
  };

  const handleSaveEditedDocument = (e) => {
    e.preventDefault();
    if (!editingDocModal || !editingDocModal.title.trim()) return;
    const chapList = appData.curriculum?.[editingDocModal.grade] || [];
    const foundChap = chapList.find((c) => c.id === editingDocModal.chapterId);

    const nextDocs = (appData.documents || []).map((d) =>
      d.id === editingDocModal.id
        ? {
            ...d,
            title: editingDocModal.title.trim(),
            grade: editingDocModal.grade,
            classId: editingDocModal.classId,
            chapterId: editingDocModal.chapterId,
            chapterTitle: foundChap
              ? foundChap.title
              : editingDocModal.chapterTitle || "Tài liệu chuyên đề",
            externalUrl: (editingDocModal.externalUrl || "").trim(),
            note: (editingDocModal.note || "").trim(),
            fileName: editingDocModal.fileName || d.fileName,
            fileType: editingDocModal.fileType || d.fileType,
            fileDataUrl: editingDocModal.fileDataUrl || d.fileDataUrl,
          }
        : d
    );
    saveToAll({
      ...appData,
      documents: nextDocs,
    });
    setEditingDocModal(null);
    notify("Đã cập nhật thông tin tài liệu học tập!", "success");
  };

  const handleDeleteDocument = (docOrId) => {
    const doc = typeof docOrId === "string" ? ((appData.documents || []).find((d) => d.id === docOrId) || { id: docOrId, title: docOrId }) : docOrId;
    askConfirm(
      `Bạn có chắc chắn muốn xóa tài liệu "${doc.title}" khỏi Kho tài liệu không?`,
      () => {
        saveToAll({
          ...appData,
          documents: (appData.documents || []).filter((d) => d.id !== doc.id),
        });
        notify(`Đã xóa tài liệu "${doc.title}".`, "info");
      }
    );
  };

  const handleExportCSV = () => {
    if (appData.students.length === 0) {
      notify("Chưa có dữ liệu học sinh để xuất file.", "warn");
      return;
    }
    const headers = [
      "Mã HS",
      "Họ và tên",
      "Lớp",
      "Khối",
      "Năm học",
      "Email đăng nhập",
      "Mật khẩu",
      "Điểm TB",
      "Tỷ lệ chuyên cần (%)",
      "Ghi chú chuyên cần",
      "Thái độ học tập",
      "Định hướng Đại học",
      "Nhận xét của Giáo viên",
    ];
    const rows = appData.students.map((s) => [
      s.id,
      `"${s.name}"`,
      s.classId,
      s.grade || "",
      `"${s.academicYear || appData.currentAcademicYear || ""}"`,
      s.email,
      s.password,
      s.score,
      s.attendanceRate,
      `"${s.attendanceNote || ""}"`,
      `"${s.attitude || ""}"`,
      `"${s.universityGoal || ""}"`,
      `"${(s.teacherComment || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Danh_sach_Lop_Hoa_${new Date().toLocaleDateString(
      "vi-VN"
    )}.csv`;
    a.click();
  };

  const handleAddInClassTest = (e) => {
    e.preventDefault();
    if (
      !activeStudent ||
      !classTestForm.testName.trim() ||
      !classTestForm.score
    )
      return;

    const newTestRecord = {
      id: "TEST" + Date.now(),
      testName: classTestForm.testName.trim(),
      testType: classTestForm.testType,
      score: parseFloat(classTestForm.score) || 0,
      maxScore: parseFloat(classTestForm.maxScore) || 10,
      date: classTestForm.date,
      teacherNote: classTestForm.teacherNote.trim(),
      attachmentName: classTestForm.attachmentName,
      attachmentType: classTestForm.attachmentType,
      attachmentDataUrl: classTestForm.attachmentDataUrl,
    };

    const existingTests = activeStudent.inClassTests || [];
    const updatedTests = [newTestRecord, ...existingTests];

    const allScores = [
      ...updatedTests.map((t) => Number(t.score)),
      ...(activeStudent.scoreHistory || []).map((h) => Number(h.score)),
    ];
    const newAvg =
      allScores.length > 0
        ? Number(
            (
              allScores.reduce((a, b) => a + b, 0) / allScores.length
            ).toFixed(2)
          )
        : newTestRecord.score;

    updateStudentField(activeStudent.id, {
      inClassTests: updatedTests,
      score: newAvg,
    });

    setClassTestForm({
      testName: "",
      testType: "Kiểm tra định kỳ / 1 tiết",
      score: "",
      maxScore: "10",
      date: new Date().toLocaleDateString("vi-VN"),
      teacherNote: "",
      attachmentName: "",
      attachmentType: "",
      attachmentDataUrl: "",
    });
    notify(`Đã lưu điểm kiểm tra cho HS ${activeStudent.name}!`, "success");
  };

  const handleSaveChapterEdit = (e) => {
    e.preventDefault();
    if (!editingChapter) return;
    const grade = editingChapter.grade;
    const reqList = editingChapter.requirementsText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const updatedChapters = (appData.curriculum[grade] || []).map((c) =>
      c.id === editingChapter.id
        ? {
            id: editingChapter.id,
            timeline: editingChapter.timeline,
            targetDate: editingChapter.targetDate,
            title: editingChapter.title,
            formulas: editingChapter.formulas,
            requirements: reqList,
          }
        : c
    );

    saveToAll({
      ...appData,
      curriculum: {
        ...appData.curriculum,
        [grade]: updatedChapters,
      },
    });
    setEditingChapter(null);
    notify("Đã cập nhật thông tin Chương trong lộ trình!", "success");
  };

  const handleAddNewChapter = (e) => {
    e.preventDefault();
    if (!newChapterForm.title.trim()) return;
    const g = newChapterForm.grade;
    const reqs = newChapterForm.requirementsText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const newChap = {
      id: `${g}-c${Date.now()}`,
      timeline: newChapterForm.timeline.trim() || "Tháng mới",
      targetDate: newChapterForm.targetDate.trim() || "Đang cập nhật",
      title: newChapterForm.title.trim(),
      formulas: newChapterForm.formulas.trim() || "Công thức trọng tâm",
      requirements:
        reqs.length > 0
          ? reqs
          : ["Nắm vững lý thuyết và vận dụng giải bài tập chương."],
    };

    const nextCurr = {
      ...appData.curriculum,
      [g]: [...(appData.curriculum[g] || []), newChap],
    };
    saveToAll({ ...appData, curriculum: nextCurr });
    setNewChapterForm({
      grade: g,
      timeline: "",
      targetDate: "",
      title: "",
      formulas: "",
      requirementsText: "",
    });
    notify(`Đã thêm "${newChap.title}" vào lộ trình Khối ${g}!`, "success");
  };

  const handleBulkExcelImport = (e) => {
    e.preventDefault();
    if (!excelBulkText.trim()) return;
    const lines = excelBulkText
      .trim()
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0);

    const newStudentsList = [...appData.students];
    const newClassesList = [...appData.classes];
    const activeYear =
      selectedAcademicYear === "ALL"
        ? appData.currentAcademicYear || "2026 - 2027"
        : selectedAcademicYear;
    let count = 0;

    lines.forEach((line, idx) => {
      const parts = line.includes("\t")
        ? line.split("\t")
        : line.includes("|")
        ? line.split("|")
        : line.split(",");

      if (parts.length >= 2) {
        const name = (parts[0] || "").trim();
        let classId =
          parts.length >= 3 ? (parts[1] || "").trim().toUpperCase() : "10A1";
        let email =
          parts.length >= 3 ? (parts[2] || "").trim() : (parts[1] || "").trim();
        let password = parts.length >= 4 ? (parts[3] || "").trim() : "123456";
        let uniGoal =
          parts.length >= 5 ? (parts[4] || "").trim() : "Đỗ Nguyện vọng 1";

        if (!name) return;

        let detectedGrade = "12";
        if (classId.startsWith("10")) detectedGrade = "10";
        else if (classId.startsWith("11")) detectedGrade = "11";
        else if (classId.startsWith("12")) detectedGrade = "12";

        if (!newClassesList.some((c) => c.id === classId)) {
          newClassesList.push({
            id: classId,
            name: `Lớp Hóa ${classId}`,
            grade: detectedGrade,
            academicYear: activeYear,
            scheduleSummary: "Theo Thời khóa biểu",
            todayDocIds: [],
          });
        }

        newStudentsList.push({
          id: `HS${Date.now().toString().slice(-4)}${idx}`,
          name,
          classId,
          grade: detectedGrade,
          academicYear: activeYear,
          email:
            email || `${name.toLowerCase().replace(/\s+/g, "")}@gmail.com`,
          password: password || "123456",
          targetScore: "8.5+",
          universityGoal: uniGoal,
          personalAchievements: "",
          score: 0,
          attendanceRate: 100,
          attendanceNote: "Đi học đầy đủ",
          attitude: "Tập trung chú ý bài giảng",
          teacherComment: "Đã khởi tạo hồ sơ học tập trực tuyến.",
          roadmapProgress: createDefaultRoadmap(detectedGrade),
          inClassTests: [],
          scoreHistory: [],
          attendanceHistory: [],
        });
        count++;
      }
    });

    if (count > 0) {
      saveToAll({
        ...appData,
        classes: newClassesList,
        students: newStudentsList,
      });
      setExcelBulkText("");
      notify(
        `Đã tạo thành công ${count} tài khoản học sinh từ danh sách Excel (Năm học ${activeYear})!`,
        "success"
      );
    }
  };

  const buildStudentReportEmail = (student) => {
    const cls = appData.classes.find((c) => c.id === student.classId);
    const recentTests = (student.inClassTests || [])
      .slice(0, 5)
      .map(
        (t) => `  • ${t.testName} (${t.date}): ${t.score}/${t.maxScore} điểm`
      )
      .join("\n");

    const subject = `[Lớp Hóa Thầy Dương Anh Tuấn Anh] Báo cáo tiến độ & Điểm kiểm tra của HS ${student.name} (${student.classId})`;
    const body = `Kính gửi Quý Phụ huynh và Học sinh ${student.name},

Hệ thống Lớp Hóa học Thầy Dương Anh Tuấn Anh (Nhật Hạ) trân trọng gửi thông báo tình hình học tập của học sinh:

1. THÔNG TIN LỚP HỌC & MỤC TIÊU:
- Học sinh: ${student.name} (Mã HS: ${student.id})
- Lớp: ${student.classId} (${cls ? cls.name : "Hóa học THPT"}) • Năm học: ${
      student.academicYear || appData.currentAcademicYear || "2026 - 2027"
    }
- Mục tiêu điểm số: ${student.targetScore} | Định hướng Đại học / Thành tích: ${
      student.universityGoal || "Đang cập nhật"
    }

2. TÌNH HÌNH CHUYÊN CẦN & THÁI ĐỘ HỌC TẬP:
- Chuyên cần (Đi học đầy đủ): ${student.attendanceRate}% — ${
      student.attendanceNote
    }
- Thái độ học tập & Mức độ chú ý bài: ${student.attitude}

3. KẾT QUẢ ĐIỂM SỐ & BÀI KIỂM TRA TRÊN LỚP:
- Điểm trung bình hiện tại: ${student.score}/10
${
  recentTests
    ? `- Các bài kiểm tra gần nhất:\n${recentTests}`
    : "- Chưa có bài kiểm tra định kỳ mới."
}

4. NHẬN XÉT CỦA GIÁO VIÊN:
"${student.teacherComment}"

Trân trọng,
Thầy Dương Anh Tuấn Anh (Nhật Hạ)
Email: ${TEACHER_INFO.email}`;

    return {
      modeBadge: `Gửi riêng cho PH/HS ${student.name}`,
      to: student.email,
      subject,
      body,
      mailtoUrl: `mailto:${encodeURIComponent(
        student.email
      )}?cc=${encodeURIComponent(
        TEACHER_INFO.email
      )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`,
    };
  };

  // Danh sách các Ô chức năng Bento Grid (Đã tách riêng 05A Tài liệu & 05B Bài tập)
  const BENTO_MODULES = [
    {
      id: "announcements",
      code: "01",
      title: "Tin tức (Học thuật • Học phí • Lớp học)",
      desc: "Chia 3 mục Học thuật, Thông báo học phí, Thông báo lớp học; tự động cập nhật khi GV tải tài liệu mới.",
      badge: `${
        (appData.announcements || []).filter((a) =>
          matchesSelectedYear(a.academicYear)
        ).length
      } bản tin`,
      bg: "bg-[#1B3B48] text-[#F7F6F2]",
      accent: "text-[#E9C46A]",
    },
    {
      id: "calendar",
      code: "02",
      title: "Thời khóa biểu, Điểm danh Live & Tài liệu",
      desc: "Đồng bộ lịch thực, điểm danh trực tiếp khi lớp đang diễn ra lúc tạo lịch và đính kèm tài liệu buổi học.",
      badge: `${
        (appData.calendarEvents || []).filter((e) =>
          matchesSelectedYear(e.academicYear)
        ).length
      } ca học • Live`,
      bg: "bg-white text-[#1B3B48] border border-[#E2DFD7]",
      accent: "text-[#5C7667]",
    },
    {
      id: "curriculum",
      code: "03",
      title: "Lộ trình & Tải Tài liệu Từng Chương",
      desc: "Nội dung Hóa 10, 11, 12 theo từng chương, tích hợp mục tải tài liệu riêng cho từng lớp, từng chương.",
      badge: `${(appData.documents || []).length} tài liệu chương`,
      bg: "bg-[#EFECE6] text-[#1B3B48] border border-[#DFDBD0]",
      accent: "text-[#1B3B48]",
    },
    {
      id: "progress",
      code: "04",
      title: "Tiến độ, Bài Kiểm tra & Nhận xét",
      desc: "Theo dõi đi học đầy đủ, chú ý nghe giảng, bảng điểm các bài kiểm tra trên lớp và nhận xét của Giáo viên.",
      badge:
        currentUser?.role === "student"
          ? "Hồ sơ của bạn"
          : `${yearFilteredStudents.length} hồ sơ HS`,
      bg: "bg-[#2C4A3E] text-[#F7F6F2]",
      accent: "text-[#E9C46A]",
    },
    {
      id: "documents",
      code: "05A",
      title: "Kho Tài liệu Lớp/Chương (Tải Tài liệu Riêng)",
      desc: "Ô riêng chuyên tải tài liệu học tập theo từng lớp & từng chương (tự động báo tin tức Học thuật Mục 01 & đồng bộ Mục 03).",
      badge: `${(appData.documents || []).length} tài liệu`,
      bg: "bg-white text-[#1B3B48] border border-[#E2DFD7]",
      accent: "text-[#5C7667]",
    },
    {
      id: "homeworks",
      code: "05B",
      title: "Giao Bài Tập, Nộp Bài & Chấm Điểm Riêng",
      desc: "Ô riêng chuyên giao bài tập qua Email (cài giờ tự khóa link nộp), cổng học sinh nộp bài và chấm điểm đồng bộ Hồ sơ Mục 04.",
      badge: `${(appData.homeworks || []).length} BTVN • ${
        (appData.homeworkSubmissions || []).length
      } bài nộp`,
      bg: "bg-[#2C4A3E] text-[#F7F6F2] border border-[#5C7667]",
      accent: "text-[#E9C46A]",
    },
    {
      id: "exams",
      code: "06",
      title: "Đề thi & App Thi thử Trực tuyến",
      desc: "Tách riêng ngân hàng đề thi tải về, đường link App Thi Thử và nơi Học sinh gửi ảnh chụp kết quả.",
      badge: `${appData.examPapers.length} đề thi`,
      bg: "bg-[#F4EFE6] text-[#1B3B48] border border-[#E0D6C3]",
      accent: "text-[#9C6644]",
    },
    {
      id: "honor",
      code: "07",
      title: "Bảng Vàng, Giải HSG & Đại học",
      desc: "Vinh danh điểm kiểm tra cao, thành tích Học sinh giỏi các cấp và danh sách Đậu Đại học (Hiển thị cả ngoài cổng đăng nhập).",
      badge: `${appData.achievements.length} vinh danh`,
      bg: "bg-white text-[#1B3B48] border border-[#E2DFD7]",
      accent: "text-[#1B3B48]",
    },
    {
      id: "chem_tools",
      code: "08",
      title: "Sổ tay Các Chất, Flashcard Riêng & Dụng cụ",
      desc: "Bảng Acid béo, Amino acid, pH & Chỉ thị, Dụng cụ thí nghiệm, Tạo Flashcard cá nhân cho HS & Mini-Game.",
      badge: "5 Bảng tra cứu • Tạo Flashcard",
      bg: "bg-[#EFECE6] text-[#1B3B48] border border-[#DFDBD0]",
      accent: "text-[#5C7667]",
    },
    ...(currentUser?.role === "teacher"
      ? [
          {
            id: "students_admin",
            code: "09",
            title: "Quản lý & Sửa Lớp, Học sinh, Điểm danh & Excel",
            desc: "Tạo/sửa/xóa lớp học, chỉnh sửa thông tin học sinh sau khi tạo, điểm danh nhanh và nhập Excel hàng loạt.",
            badge: `${yearFilteredClasses.length} lớp • ${yearFilteredStudents.length} HS`,
            bg: "bg-[#3D405B] text-[#F7F6F2]",
            accent: "text-[#F2CC8F]",
          },
        ]
      : []),
    {
      id: "chem_feed",
      code: "10",
      title: "Chuyện Hóa Học Hằng Ngày & Hỏi Đáp (Cộng điểm)",
      desc: "Bảng tin kiểu Facebook: Đăng bài báo Hóa học gợi mở, đố vui bình luận đáp án tính điểm tương tác & HS đăng câu hỏi khó.",
      badge: `${(appData.chemFeedPosts || []).length} thảo luận`,
      bg: "bg-[#1B3B48] text-[#F7F6F2] border-2 border-[#E9C46A]",
      accent: "text-[#E9C46A]",
    },
  ];

  const topClassScorers = (appData.students || [])
    .filter((s) => Number(s.score) >= 8.5)
    .map((s) => ({
      id: `TOP_SCORE_${s.id}`,
      studentName: s.name,
      classId: s.classId,
      academicYear: s.academicYear || appData.currentAcademicYear || "2026 - 2027",
      category: "Thủ khoa / Xuất sắc",
      title: `Học sinh Xuất sắc Lớp ${s.classId} — Điểm TB: ${s.score}/10`,
      scoreDetail: s.universityGoal
        ? `Mục tiêu: ${s.universityGoal} • Chuyên cần: ${s.attendanceRate}%`
        : `Chuyên cần: ${s.attendanceRate}%`,
      isAutoTop: true,
    }));

  const combinedHonorBoard = [...(appData.achievements || []), ...topClassScorers];


  // ============================================================================
  // CẦU NỐI ĐỒNG BỘ TRẠNG THÁI & HÀM XỬ LÝ CHO TOÀN BỘ 10 PHÂN HỆ (01 -> 10)
  // ============================================================================
  const userRole = currentUser?.role || "teacher";
  const currentStudentId = currentUser?.studentId || activeStudent?.id || "";
  const currentClock = realTimeNow;
  const cloudSyncStatus = syncStatus;
  const lastCloudSyncTime = lastSyncTime;

  const setActiveView = (v) => {
    if (v === "home") {
      setNavStack(["home"]);
    } else {
      navigateTo(v);
    }
  };

  const classesList = appData.classes || [];
  const students = appData.students || [];
  const academicYears = appData.academicYears || DEFAULT_ACADEMIC_YEARS;
  const timeSlots = activeTimeSlots;

  const calendarEvents = (appData.calendarEvents || []).map((ev) => ({
    ...ev,
    day: ev.day || ev.dayOfWeek || "Thứ Hai",
    classId: ev.classId || ev.targetScope || "ALL",
    grade: Number(ev.grade || 12),
    type: String(ev.targetScope || "").startsWith("HS:")
      ? "personal"
      : ev.type || "class",
    ownerId: String(ev.targetScope || "").startsWith("HS:")
      ? String(ev.targetScope).slice(3)
      : ev.ownerId || "",
  }));

  const documents = (appData.documents || []).map((d) => ({
    ...d,
    url: d.url || d.externalUrl || "#",
    chapter: d.chapter || d.chapterTitle || "Chuyên đề Hóa học",
    type: d.type || d.fileType || "PDF Chuyên đề",
    size: d.size || "PDF",
    updatedAt: d.updatedAt || d.createdAt || "",
  }));

  const homeworks = appData.homeworks || [];
  const homeworkSubmissions = (appData.homeworkSubmissions || []).map((s) => ({
    ...s,
    score: s.score !== undefined && s.score !== "" ? s.score : s.gradeScore,
    status:
      (s.gradeScore !== "" && s.gradeScore !== undefined) ||
      s.status === "graded"
        ? "graded"
        : "pending",
    answerText: s.answerText || s.studentNote || "",
  }));

  const examPapers = (appData.examPapers || []).map((ex) => ({
    ...ex,
    grade: Number(ex.grade || 12),
    category: ex.category || ex.examCategory || "THPT_QG",
    questionCount: ex.questionCount || 40,
    deadline: ex.deadline || "Đang mở",
    examAppLink: ex.examAppLink || ex.appLink || ex.fileUrl || "",
  }));

  const chemFeedPosts = appData.chemFeedPosts || [];

  const curriculumData = {
    10: (appData.curriculum?.["10"] || DEFAULT_CURRICULUM["10"] || []).map(
      (c) => ({
        ...c,
        code: c.code || c.id,
        lessons: c.lessons || c.timeline || "",
        yccd: c.yccd || c.requirements || [],
      })
    ),
    11: (appData.curriculum?.["11"] || DEFAULT_CURRICULUM["11"] || []).map(
      (c) => ({
        ...c,
        code: c.code || c.id,
        lessons: c.lessons || c.timeline || "",
        yccd: c.yccd || c.requirements || [],
      })
    ),
    12: (appData.curriculum?.["12"] || DEFAULT_CURRICULUM["12"] || []).map(
      (c) => ({
        ...c,
        code: c.code || c.id,
        lessons: c.lessons || c.timeline || "",
        yccd: c.yccd || c.requirements || [],
      })
    ),
  };

  const selectedStudent = activeStudent || {
    id: "HS01",
    name: "Chưa có học sinh",
    classId: classesList[0]?.id || "12A1",
    grade: 12,
    score: 0,
    targetScore: 9.0,
    universityGoal: "ĐH Y Dược",
    attendanceRate: 100,
    attendanceNote: "Đi học đầy đủ",
    attitude: "Tích cực",
    teacherComment: "Chưa có nhận xét",
    inClassTests: [],
  };

  const weekDatesList = activeWeekInfo.days.map((d) => ({
    dayName: d.dayOfWeek,
    dateISO: d.dateKey,
    shortLabel: d.shortDate,
    isToday: d.isToday,
  }));

  const getEventRealtimeStatus = (ev, nowObj) => {
    const dayObj = activeWeekInfo.days.find(
      (d) => d.dayOfWeek === (ev.day || ev.dayOfWeek)
    );
    const dKey = ev.dateISO || (dayObj ? dayObj.dateKey : toDateKey(nowObj));
    const st = getLiveSessionStatus(dKey, ev.startTime, ev.endTime, nowObj);
    return st ? { ...st, badgeClass: st.color } : null;
  };

  const handleAddTimeSlot = handleAddCustomTimeSlot;

  const handleDeleteEvent = (evId) => {
    saveToAll({
      ...appData,
      calendarEvents: (appData.calendarEvents || []).filter(
        (x) => x.id !== evId
      ),
    });
    notify("Đã xóa ca học khỏi lịch.", "info");
  };

  const initCalFormAttendanceForClass = (cid) => {
    const list =
      cid === "ALL" ? appData.students || [] : getStudentsOfClass(cid);
    const recs = list.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      status: "present",
      note: "Chú ý nghe giảng",
    }));
    setCalFormAttendanceRecords(recs);
  };

  const handleDeleteCurriculumChapter = (gradeNum, chapCode) => {
    const g = String(gradeNum);
    const nextList = (appData.curriculum?.[g] || []).filter(
      (c) => (c.code || c.id) !== chapCode
    );
    saveToAll({
      ...appData,
      curriculum: {
        ...appData.curriculum,
        [g]: nextList,
      },
    });
    notify(`Đã xóa chương ${chapCode} khỏi Khối ${g}.`, "info");
  };

  const [testForm, setTestFormState] = useState({
    testName: "",
    score: "",
    note: "",
  });
  const setTestForm = (nextVal) => {
    setTestFormState(nextVal);
    setClassTestForm((prev) => ({
      ...prev,
      testName: nextVal.testName || "",
      score: nextVal.score || "",
      teacherNote: nextVal.note || "",
    }));
  };

  const [docUploadForm, setDocUploadFormState] = useState({
    grade: 12,
    classId: "ALL",
    chapter:
      DEFAULT_CURRICULUM["12"]?.[0]?.title || "Chương 1: Ester – Lipid",
    title: "",
    type: "PDF Chuyên đề",
    size: "2.0 MB",
    url: "",
    fileName: "",
    fileDataUrl: "",
  });
  const setDocUploadForm = (updater) => {
    setDocUploadFormState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setDocForm((dPrev) => ({
        ...dPrev,
        grade: String(next.grade || 12),
        classId: next.classId || "ALL",
        title: next.title || "",
        externalUrl: next.url || "",
        fileName: next.fileName || "",
        fileType: next.type || "PDF Chuyên đề",
        fileDataUrl: next.fileDataUrl || "",
      }));
      return next;
    });
  };

  const isHomeworkPastDeadline = (hw, nowObj) =>
    getHomeworkDeadlineStatus(hw, nowObj).isExpired;
  const formatDeadlineCountdown = (hw, nowObj) => {
    const st = getHomeworkDeadlineStatus(hw, nowObj);
    return st.remainingText || st.label;
  };

  const hwSubmitForm = {
    homeworkId: hwSubForm.homeworkId,
    answerText: hwSubForm.studentNote,
    fileName: hwSubForm.fileName,
    fileDataUrl: hwSubForm.fileDataUrl,
  };
  const setHwSubmitForm = (updater) => {
    setHwSubForm((prev) => {
      const mappedPrev = {
        homeworkId: prev.homeworkId,
        answerText: prev.studentNote,
        fileName: prev.fileName,
        fileDataUrl: prev.fileDataUrl,
      };
      const next =
        typeof updater === "function" ? updater(mappedPrev) : updater;
      return {
        ...prev,
        homeworkId: next.homeworkId ?? prev.homeworkId,
        studentNote: next.answerText ?? prev.studentNote,
        fileName: next.fileName ?? prev.fileName,
        fileDataUrl: next.fileDataUrl ?? prev.fileDataUrl,
      };
    });
  };

  const selectedHwForTracking = selectedTrackerHwId;
  const setSelectedHwForTracking = setSelectedTrackerHwId;
  const gradingBuffer = gradingInputs;
  const setGradingBuffer = setGradingInputs;

  const [selectedRefTab, setSelectedRefTab] = useState("fatty_acids");
  const [showBulkImportBox, setShowBulkImportBox] = useState(false);
  const [bulkImportClassId, setBulkImportClassId] = useState("12A1");
  const bulkImportText = excelBulkText;
  const setBulkImportText = setExcelBulkText;

  const newStudentForm = singleStudent;
  const setNewStudentForm = setSingleStudent;

  const handleAddClass = (e) => {
    e.preventDefault();
    const cid = (newClassForm.id || "").trim().toUpperCase();
    const cname = (newClassForm.name || "").trim();
    if (!cid || !cname) return;
    if ((appData.classes || []).some((c) => isSameClass(c.id, cid))) {
      notify(`Mã lớp ${cid} đã tồn tại!`, "warn");
      return;
    }
    const newCls = {
      id: cid,
      name: cname,
      grade: String(newClassForm.grade || "12"),
      academicYear:
        newClassForm.academicYear ||
        appData.currentAcademicYear ||
        "2026 - 2027",
      scheduleSummary:
        (newClassForm.scheduleSummary || "").trim() || "Theo Thời khóa biểu",
      todayDocIds: [],
    };
    saveToAll({
      ...appData,
      classes: [...(appData.classes || []), newCls],
    });
    setNewClassForm({
      ...newClassForm,
      id: "",
      name: "",
      scheduleSummary: "",
    });
    notify(`✅ Đã tạo Lớp ${cid} (${cname}) thành công!`, "success");
  };

  const handleAddStudentAccount = (e) => {
    e.preventDefault();
    if (!singleStudent.name.trim()) return;
    const cid = (singleStudent.classId || "12A1").trim().toUpperCase();
    const foundCls = (appData.classes || []).find((c) =>
      isSameClass(c.id, cid)
    );
    const newSt = {
      id: "HS" + Date.now().toString().slice(-5),
      name: singleStudent.name.trim(),
      classId: cid,
      grade: foundCls ? foundCls.grade : "12",
      academicYear:
        foundCls?.academicYear ||
        appData.currentAcademicYear ||
        "2026 - 2027",
      email:
        singleStudent.email.trim() ||
        `${singleStudent.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "")}@gmail.com`,
      password: singleStudent.password.trim() || "123456",
      targetScore: singleStudent.targetScore || "8.5+",
      universityGoal: singleStudent.universityGoal || "Đỗ Nguyện vọng 1",
      score: 0,
      attendanceRate: 100,
      attendanceNote: "Đi học đầy đủ",
      attitude: "Chú ý nghe giảng",
      teacherComment: "Đã khởi tạo hồ sơ học tập.",
      inClassTests: [],
      scoreHistory: [],
      attendanceHistory: [],
    };
    saveToAll({
      ...appData,
      students: [...(appData.students || []), newSt],
    });
    setSingleStudent({
      ...singleStudent,
      name: "",
      email: "",
      password: "",
      universityGoal: "",
    });
    notify(`✅ Đã cấp tài khoản cho Học sinh ${newSt.name}!`, "success");
  };

  const handleDeleteStudent = (studentId) => {
    const st = (appData.students || []).find((s) => s.id === studentId);
    askConfirm(
      `Bạn có chắc chắn muốn xóa Học sinh ${st ? st.name : studentId} không?`,
      () => {
        saveToAll({
          ...appData,
          students: (appData.students || []).filter((s) => s.id !== studentId),
        });
        notify("Đã xóa học sinh khỏi danh sách.", "info");
      }
    );
  };

  const handleAddExamPaper = (e) => {
    e.preventDefault();
    if (!examForm.title.trim()) return;
    const newEx = {
      id: "EX_" + Date.now(),
      title: examForm.title.trim(),
      grade: examForm.grade || 12,
      classId: examForm.classId || "ALL",
      examCategory: examForm.category || examForm.examCategory || "THPT_QG",
      duration: examForm.duration || 50,
      appLink: examForm.examAppLink || examForm.appLink || "",
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };
    saveToAll({
      ...appData,
      examPapers: [newEx, ...(appData.examPapers || [])],
    });
    setExamForm({ ...examForm, title: "", examAppLink: "" });
    notify("Đã đăng đề thi mới lên Ngân hàng đề!", "success");
  };

  const handleDeleteExamPaper = (exId) => {
    saveToAll({
      ...appData,
      examPapers: (appData.examPapers || []).filter((x) => x.id !== exId),
    });
    notify("Đã xóa đề thi.", "info");
  };

  const handleDeleteAchievement = (achId) => {
    saveToAll({
      ...appData,
      achievements: (appData.achievements || []).filter((x) => x.id !== achId),
    });
    notify("Đã xóa mục vinh danh.", "info");
  };

  const [attendanceDate, setAttendanceDate] = useState(() =>
    toDateKey(new Date())
  );
  const attendanceLessonTitle = sessionTopic;
  const setAttendanceLessonTitle = setSessionTopic;

  const attendanceDraftRecords = attendanceModalClass
    ? (attendanceModalClass.id === "ALL"
        ? appData.students || []
        : getStudentsOfClass(attendanceModalClass.id)
      ).map((st) => {
        const rec = sessionRecords[st.id] || {
          status: "PRESENT",
          attitude: "Chú ý nghe giảng",
        };
        const mapSt =
          rec.status === "PRESENT"
            ? "present"
            : rec.status === "LATE"
            ? "late"
            : rec.status === "EXCUSED"
            ? "excused"
            : rec.status === "UNEXCUSED"
            ? "unexcused"
            : rec.status || "present";
        return {
          studentId: st.id,
          studentName: st.name,
          status: mapSt,
          note: rec.attitude || "",
        };
      })
    : [];

  const setAttendanceDraftRecords = (nextList) => {
    const nextMap = { ...sessionRecords };
    (nextList || []).forEach((item) => {
      nextMap[item.studentId] = {
        status: String(item.status || "present").toUpperCase(),
        attitude: item.note || "Chú ý nghe giảng",
      };
    });
    setSessionRecords(nextMap);
  };


  // ============================================================================
  // MÀN HÌNH KHI CHƯA ĐĂNG NHẬP (HIỂN THỊ BẢNG VÀNG THÀNH TÍCH BÊN NGOÀI CỔNG ĐĂNG NHẬP)
  // ============================================================================
  if (!currentUser) {
    const filteredPublicHonors = combinedHonorBoard.filter((ach) => {
      if (publicHonorFilter !== "ALL" && ach.category !== publicHonorFilter) {
        return false;
      }
      if (
        publicHonorYearFilter !== "ALL" &&
        ach.academicYear &&
        ach.academicYear !== publicHonorYearFilter
      ) {
        return false;
      }
      return true;
    });

    return (
      <div className="min-h-screen bg-[#F7F6F2] text-[#1B3B48] flex flex-col justify-between font-sans">
        <header className="bg-[#1B3B48] text-[#F7F6F2] py-4 px-6 border-b border-[#5C7667]/40 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5C7667] flex items-center justify-center font-bold text-sm text-white">
                HÓA
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  {TEACHER_INFO.fullName}
                </h1>
                <p className="text-xs text-[#D8E2DC]">
                  {TEACHER_INFO.subNote} • Năm học hiện tại:{" "}
                  <strong className="text-[#E9C46A]">
                    {appData.currentAcademicYear || "2026 - 2027"}
                  </strong>
                </p>
              </div>
            </div>
            <div className="text-xs text-[#E9C46A] font-mono font-bold">
              🕒 {realTimeNow.toLocaleTimeString("vi-VN")} •{" "}
              {realTimeNow.toLocaleDateString("vi-VN")}
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-8">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-[#E2DFD7] shadow-lg overflow-hidden">
            <div className="lg:col-span-6 p-6 sm:p-8 bg-[#EFECE6] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#1B3B48] text-white text-xs font-bold uppercase tracking-wider">
                    Cổng Học tập Nội bộ
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#5C7667] text-white text-xs font-bold">
                    📅 Năm học {appData.currentAcademicYear || "2026 - 2027"}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3B48] leading-snug">
                  Theo dõi tiến độ tường tận,
                  <br />
                  Đồng hành vững bước mỗi ngày.
                </h2>
                <blockquote className="p-4 rounded-2xl bg-white border-l-4 border-[#5C7667] text-xs sm:text-sm italic text-[#1B3B48]/90 leading-relaxed">
                  "{TEACHER_INFO.quote}"
                </blockquote>
              </div>

              <div className="space-y-2 text-xs text-[#5C7667] border-t border-[#DFDBD0] pt-4">
                <div className="font-bold text-[#1B3B48]">
                  Quy định Bảo mật & Tiện ích Hệ thống:
                </div>
                <p>
                  • Lộ trình học tập, tài liệu từng chương/lớp, lịch học đính kèm tài liệu hôm đó và bảng điểm cá nhân được bảo mật riêng tư.
                </p>
                <p>
                  • Bản tin lớp học được phân chia rõ: <strong>Học thuật</strong>, <strong>Thông báo học phí</strong> và <strong>Thông báo lớp học</strong> giúp Quý Phụ huynh dễ dàng theo dõi.
                </p>
                <p>
                  • Phụ huynh và Học sinh vui lòng đăng nhập bằng tài khoản đã được Thầy{" "}
                  <strong>{TEACHER_INFO.fullName}</strong> cấp để truy cập hệ thống.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 sm:p-8 bg-[#1B3B48] text-[#F7F6F2] flex flex-col justify-center space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#E9C46A]">
                  Xác thực Tài khoản
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Đăng nhập Lớp học
                </h3>
                <p className="text-xs text-gray-300">
                  Dành cho Giáo viên, Phụ huynh và Học sinh của lớp.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-gray-200">
                    Tài khoản đăng nhập (Email / Mã HS / Họ tên)
                  </label>
                  <input
                    type="text"
                    required
                    value={loginAccount}
                    onChange={(e) => setLoginAccount(e.target.value)}
                    placeholder="Nhập Email hoặc Mã học sinh..."
                    className="w-full px-4 py-3 rounded-xl bg-white text-[#1B3B48] text-sm font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-gray-200">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-white text-[#1B3B48] text-sm font-medium focus:outline-none"
                  />
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-100 text-xs font-medium">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#5C7667] hover:bg-[#4A6154] text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-md"
                >
                  Đăng nhập vào Lớp học
                </button>
              </form>

              <div className="pt-4 border-t border-white/10 text-xs text-gray-300 flex items-center justify-between">
                <span>Hỗ trợ cấp tài khoản:</span>
                <a
                  href={`mailto:${TEACHER_INFO.email}`}
                  className="text-[#E9C46A] underline font-semibold"
                >
                  {TEACHER_INFO.email}
                </a>
              </div>
            </div>
          </div>

          <section className="bg-white rounded-3xl border-2 border-[#E9C46A] shadow-md p-6 sm:p-8 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B3B48] text-[#E9C46A] text-xs font-extrabold uppercase tracking-wider">
                  🏆 Bảng Vàng Vinh Danh Thành Tích Trong Lớp
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B3B48]">
                  Tự hào Thành tích Học sinh Giỏi, Điểm 10 & Đậu Đại học
                </h3>
                <p className="text-xs text-[#5C7667]">
                  Ghi nhận những nỗ lực bứt phá của các thế hệ học sinh Lớp Hóa Thầy{" "}
                  <strong>{TEACHER_INFO.fullName}</strong> ({TEACHER_INFO.subNote}).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={publicHonorYearFilter}
                  onChange={(e) => setPublicHonorYearFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E2DFD7] bg-[#F7F6F2] text-xs font-bold text-[#1B3B48]"
                >
                  <option value="ALL">📅 Tất cả Năm học</option>
                  {(appData.academicYears || DEFAULT_ACADEMIC_YEARS).map((y) => (
                    <option key={y} value={y}>
                      Năm học {y}
                    </option>
                  ))}
                </select>

                {[
                  { id: "ALL", label: "Tất cả" },
                  { id: "Đậu Đại học", label: "🎓 Đậu Đại học" },
                  { id: "Học sinh giỏi", label: "🏅 Học sinh giỏi" },
                  { id: "Thủ khoa / Xuất sắc", label: "🏆 Điểm cao / Xuất sắc" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPublicHonorFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      publicHonorFilter === tab.id
                        ? "bg-[#1B3B48] text-[#E9C46A]"
                        : "bg-[#EFECE6] text-[#1B3B48] hover:bg-[#E2DFD7]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredPublicHonors.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#F7F6F2] border border-dashed border-[#DFDBD0] text-center space-y-1.5">
                <div className="text-sm font-bold text-[#1B3B48]">
                  🏆 Bảng Vàng hiện đang để trống để Giáo viên cập nhật
                </div>
                <p className="text-xs text-[#5C7667]">
                  Giáo viên đăng nhập và vào <strong>Mục 07 (Bảng Vàng)</strong> để thêm học sinh đạt giải HSG, Điểm 10 hoặc Đậu Đại học hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredPublicHonors.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-5 rounded-2xl bg-gradient-to-br from-[#F7F6F2] to-[#EFECE6] border border-[#E0D6C3] flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1B3B48] text-[#E9C46A] text-[11px] font-bold">
                          {ach.category} • Lớp {ach.classId}
                        </span>
                        <span className="text-[11px] font-bold text-[#5C7667] bg-white px-2 py-0.5 rounded-md border border-[#E2DFD7]">
                          NH: {ach.academicYear || "2026 - 2027"}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-[#1B3B48]">
                        🌟 {ach.studentName}
                      </h4>
                      <p className="text-sm font-bold text-[#2C4A3E]">
                        {ach.title}
                      </p>
                      {ach.scoreDetail && (
                        <p className="text-xs text-[#5C7667] font-medium">
                          {ach.scoreDetail}
                        </p>
                      )}
                    </div>
                    {ach.imageDataUrl && (
                      <img
                        src={ach.imageDataUrl}
                        alt={ach.studentName}
                        className="w-full h-36 object-cover rounded-xl border border-[#E2DFD7] mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="bg-[#EFECE6] border-t border-[#DFDBD0] py-4 px-6 text-center text-xs text-[#5C7667]">
          <strong>{TEACHER_INFO.fullName}</strong> ({TEACHER_INFO.subNote}) • Hệ thống Quản lý Học tập Môn Hóa học 10 • 11 • 12
        </footer>
      </div>
    );
  }

  const notificationFeed = [
    ...(appData.announcements || [])
      .filter((a) => {
        if (!matchesSelectedYear(a.academicYear)) return false;
        if (currentUser?.role === "student") {
          if (
            a.sendMode === "INDIVIDUAL" &&
            a.targetStudentId &&
            a.targetStudentId !== currentUser.studentId
          ) {
            return false;
          }
          if (
            a.sendMode === "BULK" &&
            a.classId !== "ALL" &&
            a.classId !== currentUser.classId
          ) {
            return false;
          }
        }
        return true;
      })
      .map((a) => {
        const catMeta = getNewsCategoryMeta(a.category || "CLASS_NOTICE");
        return {
          id: `NOTIF_ANN_${a.id}`,
          badge: catMeta.badge,
          title: a.title,
          sub: `${a.targetLabel || a.classId} • ${a.date}`,
          targetView: a.linkedHomeworkId ? "homeworks" : "announcements",
          category: a.category || "CLASS_NOTICE",
        };
      }),
    ...(currentUser?.role === "teacher"
      ? (appData.homeworkSubmissions || []).map((sub) => ({
          id: `NOTIF_SUB_${sub.id}`,
          badge: "📤 HS Nộp bài tập",
          title: `HS ${sub.studentName} (${sub.classId}) đã nộp: ${sub.homeworkTitle}`,
          sub: `${sub.submittedAt} • ${
            sub.gradeScore !== "" && sub.gradeScore !== undefined
              ? `Đã chấm: ${sub.gradeScore}/10`
              : "Chưa chấm điểm"
          }`,
          targetView: "homeworks",
          category: "SUBMISSION",
        }))
      : []),
    ...(appData.chemFeedPosts || [])
      .filter((p) => matchesSelectedYear(p.academicYear))
      .map((p) => ({
        id: `NOTIF_FEED_${p.id}`,
        badge:
          p.postType === "STUDENT_QA"
            ? "🙋‍♂️ HS Hỏi bài khó"
            : p.postType === "QUIZ_CHALLENGE"
            ? "🧩 Đố vui Hóa học (+Điểm)"
            : "📰 Chuyện Hóa học hằng ngày",
        title: `${p.authorName}: ${
          p.title || p.content.slice(0, 65)
        }`,
        sub: `${p.createdAt} • ${(p.comments || []).length} bình luận giải đáp`,
        targetView: "chem_feed",
        category: "CHEM_FEED",
      })),
  ];

  const unreadNotifications = notificationFeed.filter(
    (n) => !readNotifIds.includes(n.id)
  );

  // ============================================================================
  // GIAO DIỆN CHÍNH SAU KHI ĐÃ ĐĂNG NHẬP
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1B3B48] flex flex-col font-sans">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-[#1B3B48] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#E9C46A] flex items-center justify-between gap-3 text-xs font-semibold">
          <span>{toastMsg.text}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-[#E9C46A] font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E2DFD7]">
            <h3 className="font-bold text-base text-[#1B3B48]">
              Xác nhận thao tác
            </h3>
            <p className="text-xs text-[#5C7667] leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-bold text-[#1B3B48]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  if (fn) fn();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-[#1B3B48] text-[#F7F6F2] border-b border-[#5C7667]/40 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div
            onClick={() => setNavStack(["home"])}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#5C7667] flex items-center justify-center font-bold text-sm text-white">
              HÓA
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-wide text-white group-hover:text-[#E9C46A] transition">
                {TEACHER_INFO.fullName}
              </h1>
              <div className="flex items-center gap-2 text-xs text-[#D8E2DC]">
                <span className="px-2 py-0.5 rounded bg-white/10 font-medium">
                  {TEACHER_INFO.subNote}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline font-mono text-[#E9C46A]">
                  🕒 {realTimeNow.toLocaleTimeString("vi-VN")} (
                  {realTimeNow.toLocaleDateString("vi-VN")})
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#2C4A3E] px-2.5 py-1.5 rounded-lg border border-[#5C7667] text-xs">
              <span className="text-[#E9C46A] font-bold">📅 Năm học:</span>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="text-[#1B3B48]">
                  Tất cả các năm
                </option>
                {(appData.academicYears || DEFAULT_ACADEMIC_YEARS).map((y) => (
                  <option key={y} value={y} className="text-[#1B3B48]">
                    {y}
                  </option>
                ))}
              </select>
              {currentUser.role === "teacher" && (
                <button
                  onClick={() => setShowYearManagerModal(true)}
                  className="ml-1 px-1.5 py-0.5 rounded bg-white/15 hover:bg-white/25 text-[10px] font-bold text-[#E9C46A]"
                  title="Thêm hoặc cài đặt Năm học"
                >
                  + Năm học
                </button>
              )}
            </div>

            {currentUser.role === "teacher" && (
              <button
                onClick={() => setShowCloudModal(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                  firebaseUrl
                    ? syncStatus === "error"
                      ? "bg-red-900/50 border-red-400 text-red-100"
                      : "bg-[#2C4A3E] border-[#5C7667] text-[#E9F5DB]"
                    : "bg-[#9C6644] border-[#D4A373] text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                {firebaseUrl
                  ? syncStatus === "syncing"
                    ? "Đang đồng bộ..."
                    : `Đám mây (${lastSyncTime || "Đã kết nối"})`
                  : "Kết nối Đám mây Firebase"}
              </button>
            )}

            {firebaseUrl && (
              <button
                onClick={() => fetchFromFirebase(false)}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition"
              >
                ↻ Cập nhật
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBellDropdown((prev) => !prev)}
                className="relative px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition"
                title="Chuông thông báo tin tức, bài tập & bài nộp mới"
              >
                <span className="text-base leading-none">🔔</span>
                <span className="hidden sm:inline">Thông báo</span>
                {unreadNotifications.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showBellDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-[#1B3B48] rounded-2xl shadow-2xl border-2 border-[#1B3B48] z-50 overflow-hidden">
                  <div className="p-3.5 bg-[#1B3B48] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>🔔</span>
                      <span className="font-bold text-xs">
                        Thông báo Tin đã lên ({unreadNotifications.length} chưa đọc)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadNotifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            markAllNotificationsRead(
                              notificationFeed.map((x) => x.id)
                            )
                          }
                          className="text-[10px] text-[#E9C46A] underline font-bold"
                        >
                          Đọc tất cả
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowBellDropdown(false)}
                        className="text-xs font-bold text-gray-300 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#EFECE6]">
                    {notificationFeed.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#5C7667]">
                        Chưa có thông báo mới nào.
                      </div>
                    ) : (
                      notificationFeed.slice(0, 15).map((item) => {
                        const isUnread = !readNotifIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              markSingleNotificationRead(item.id);
                              setShowBellDropdown(false);
                              navigateTo(item.targetView);
                            }}
                            className={`p-3 text-xs cursor-pointer transition hover:bg-[#EFECE6] ${
                              isUnread ? "bg-amber-50/70" : "bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded bg-[#1B3B48] text-[#E9C46A] text-[10px] font-bold">
                                {item.badge}
                              </span>
                              {isUnread && (
                                <span className="text-[10px] font-extrabold text-rose-600">
                                  ● Mới
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-[#1B3B48] leading-snug">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-[#5C7667] mt-0.5">
                              {item.sub}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2.5 bg-[#F7F6F2] border-t border-[#E2DFD7] flex justify-between items-center text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBellDropdown(false);
                        navigateTo("announcements");
                      }}
                      className="font-bold text-[#1B3B48] hover:underline"
                    >
                      Xem tất cả Tin tức (Mục 01) →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBellDropdown(false);
                        navigateTo("homeworks");
                      }}
                      className="font-bold text-[#2C4A3E] hover:underline"
                    >
                      Kiểm tra & Chấm bài nộp →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-xs">
              <span className="font-semibold text-[#E9C46A]">
                {currentUser.role === "teacher"
                  ? `GV: ${TEACHER_INFO.fullName}`
                  : `HS: ${currentUser.name} (${currentUser.classId})`}
              </span>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setNavStack(["home"]);
                }}
                className="bg-white text-[#1B3B48] px-2.5 py-0.5 rounded font-bold hover:bg-gray-200 transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* THANH ĐIỀU HƯỚNG */}
      <div className="bg-[#EFECE6] border-b border-[#DFDBD0] px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {activeView !== "home" && (
              <button
                onClick={goBack}
                className="bg-[#1B3B48] hover:bg-[#2C4A3E] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                ← Quay lại trang trước
              </button>
            )}
            <button
              onClick={() => setNavStack(["home"])}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === "home"
                  ? "bg-[#1B3B48] text-white"
                  : "bg-white text-[#1B3B48] border border-[#DFDBD0] hover:bg-gray-50"
              }`}
            >
              Bảng điều khiển chính
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {BENTO_MODULES.map((m) => (
              <button
                key={m.id}
                onClick={() => navigateTo(m.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  activeView === m.id
                    ? "bg-[#5C7667] text-white font-bold"
                    : "text-[#1B3B48] hover:bg-white/70"
                }`}
              >
                {m.code}. {m.title.split("(")[0].split("&")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-8">
        {/* TRANG CHỦ BẢNG ĐIỀU KHIỂN */}
        {activeView === "home" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E2DFD7] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C7667]">
                    {currentUser.role === "teacher"
                      ? "Chế độ Quản trị Độc quyền Giáo viên"
                      : `Cổng thông tin Phụ huynh & Học sinh — Lớp ${currentUser.classId}`}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1B3B48] text-[#E9C46A] text-xs font-bold">
                    📅 Năm học:{" "}
                    {selectedAcademicYear === "ALL"
                      ? "Tất cả các năm"
                      : selectedAcademicYear}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#1B3B48]">
                  Xin chào, {currentUser.name}
                </h2>
                <p className="text-xs text-[#5C7667] italic">
                  "{TEACHER_INFO.quote}"
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigateTo("documents")}
                  className="bg-[#2C4A3E] hover:bg-[#1B3B48] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition"
                >
                  📚 Ô Tải Tài Liệu (Mục 05A)
                </button>
                <button
                  onClick={() => navigateTo("homeworks")}
                  className="bg-[#1B3B48] hover:bg-[#2C4A3E] text-[#E9C46A] px-3.5 py-2 rounded-xl text-xs font-bold transition"
                >
                  📝 Ô Giao Bài Tập (Mục 05B)
                </button>
                <button
                  onClick={() => navigateTo("calendar")}
                  className="bg-[#5C7667] hover:bg-[#4A6154] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition"
                >
                  📅 Lịch Thực & Điểm Danh Live
                </button>
                <button
                  onClick={() => navigateTo("chem_feed")}
                  className="bg-[#9C6644] hover:bg-[#7F5135] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  🔥 Chuyện Hóa Học (+Điểm)
                </button>
              </div>
            </div>

            {/* Danh sách Lớp học & Tài liệu học hôm nay */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2DFD7] shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-[#1B3B48] uppercase tracking-wider">
                  Danh sách Lớp học & Tài liệu học hôm nay (
                  {yearFilteredClasses.length} lớp • Năm học{" "}
                  {selectedAcademicYear === "ALL"
                    ? "Tất cả"
                    : selectedAcademicYear}
                  )
                </h3>
                {currentUser.role === "teacher" && (
                  <button
                    onClick={() => navigateTo("students_admin")}
                    className="text-xs font-bold text-[#5C7667] hover:underline"
                  >
                    + Tạo / Sửa lớp / Quản lý Học sinh / Điểm danh →
                  </button>
                )}
              </div>

              {yearFilteredClasses.length === 0 && (
                <div className="p-6 rounded-2xl bg-[#F7F6F2] border border-dashed border-[#DFDBD0] text-center space-y-2">
                  <div className="text-sm font-bold text-[#1B3B48]">
                    Chưa có lớp học nào được tạo trong năm học này
                  </div>
                  <p className="text-xs text-[#5C7667]">
                    Bạn hãy vào <strong>Mục 09</strong> để tạo các lớp học mới của mình.
                  </p>
                  {currentUser.role === "teacher" && (
                    <button
                      onClick={() => navigateTo("students_admin")}
                      className="bg-[#1B3B48] text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      + Vào Mục 09 Tạo Lớp Học Ngay
                    </button>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {yearFilteredClasses
                  .filter(
                    (cls) =>
                      currentUser.role === "teacher" ||
                      cls.id === currentUser.classId
                  )
                  .map((cls) => {
                    const count = getStudentsOfClass(cls.id).length;
                    const todayMaterials = getTodayMaterialsForClass(cls);

                    return (
                      <div
                        key={cls.id}
                        className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E2DFD7] flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#1B3B48] text-white text-xs font-bold">
                              Lớp {cls.id}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#5C7667]/15 text-[#2C4A3E] text-xs font-extrabold">
                              👥 {count} học sinh
                            </span>
                          </div>
                          <div className="font-bold text-sm text-[#1B3B48]">
                            {cls.name}
                          </div>
                          <div className="text-[11px] text-[#5C7667]">
                            Khối {cls.grade} • {cls.scheduleSummary}
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-[#DFDBD0] space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-extrabold text-[#1B3B48]">
                                📎 Tài liệu học hôm nay:
                              </span>
                              {currentUser.role === "teacher" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingClassDocsModal({
                                      ...cls,
                                      todayDocIds: cls.todayDocIds || [],
                                      todayCustomDocTitle:
                                        cls.todayCustomDocTitle || "",
                                      todayCustomDocUrl:
                                        cls.todayCustomDocUrl || "",
                                    })
                                  }
                                  className="text-[10px] font-bold text-[#5C7667] hover:underline"
                                >
                                  ✎ Đính kèm TL
                                </button>
                              )}
                            </div>

                            {todayMaterials.length === 0 ? (
                              <p className="text-[11px] text-[#5C7667] italic">
                                Chưa đính kèm tài liệu buổi học hôm nay.
                              </p>
                            ) : (
                              <div className="space-y-1">
                                {todayMaterials.map((mat) => (
                                  <div
                                    key={mat.id}
                                    className="text-[11px] flex items-center justify-between gap-1 bg-[#F7F6F2] px-2 py-1 rounded border border-[#E2DFD7]"
                                  >
                                    <span className="font-semibold text-[#1B3B48] truncate">
                                      📄 {mat.title}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {mat.url && (
                                        <a
                                          href={mat.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="px-1.5 py-0.5 rounded bg-[#1B3B48] text-white text-[10px] font-bold"
                                        >
                                          Mở
                                        </a>
                                      )}
                                      {mat.dataUrl && (
                                        <a
                                          href={mat.dataUrl}
                                          download={mat.fileName || "tailieu"}
                                          className="px-1.5 py-0.5 rounded bg-[#5C7667] text-white text-[10px] font-bold"
                                        >
                                          Tải
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {currentUser.role === "teacher" && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2DFD7] text-[11px] font-bold">
                            <button
                              type="button"
                              onClick={() => openQuickAttendance(cls)}
                              className="text-[#2C4A3E] hover:underline"
                            >
                              ✓ Điểm danh & TL
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingClassModal({
                                  originalId: cls.id,
                                  id: cls.id,
                                  name: cls.name || "",
                                  grade: cls.grade || "12",
                                  academicYear:
                                    cls.academicYear ||
                                    appData.currentAcademicYear ||
                                    "2026 - 2027",
                                  scheduleSummary: cls.scheduleSummary || "",
                                })
                              }
                              className="text-[#9C6644] hover:underline"
                            >
                              ✎ Sửa lớp
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClassFilter(cls.id);
                                navigateTo("progress");
                              }}
                              className="text-[#1B3B48] hover:underline"
                            >
                              Xem HS
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClass(cls)}
                              className="text-red-600 hover:underline"
                            >
                              Xóa lớp
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Lưới các ô chức năng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BENTO_MODULES.map((box) => (
                <div
                  key={box.id}
                  onClick={() => navigateTo(box.id)}
                  className={`${box.bg} rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer flex flex-col justify-between min-h-[190px]`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black tracking-widest uppercase ${box.accent}`}
                      >
                        MỤC {box.code}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/10">
                        {box.badge}
                      </span>
                    </div>
                    <h4 className="text-base font-bold leading-snug">
                      {box.title}
                    </h4>
                    <p className="text-xs opacity-85 leading-relaxed">
                      {box.desc}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-xs font-bold">
                    <span>Truy cập ngay</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            MỤC 01: BẢN TIN LỚP HỌC
        =================================================================== */}
        {activeView === "announcements" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E2DFD7] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase text-[#5C7667]">
                  Mục 01 • Truyền thông Lớp học & Tự động cập nhật khi tải Tài liệu
                </span>
                <h2 className="text-2xl font-bold text-[#1B3B48]">
                  Bản tin Lớp học (Học thuật • Bài tập & Deadline • Học phí • Lớp học)
                </h2>
              </div>
              <button
                onClick={goBack}
                className="px-4 py-2 rounded-xl bg-[#EFECE6] text-[#1B3B48] text-xs font-bold hover:bg-[#E2DFD7]"
              >
                ← Quay lại trang trước
              </button>
            </div>

            {currentUser.role === "teacher" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!annForm.title.trim() || !annForm.content.trim()) return;
                  const activeYear =
                    selectedAcademicYear === "ALL"
                      ? appData.currentAcademicYear || "2026 - 2027"
                      : selectedAcademicYear;

                  let recipients = [];
                  let targetLabel = "";
                  if (annForm.sendMode === "INDIVIDUAL") {
                    const st = appData.students.find(
                      (s) => s.id === annForm.targetStudentId
                    );
                    if (st) {
                      recipients = [st];
                      targetLabel = `HS ${st.name} (${st.classId})`;
                    }
                  } else {
                    recipients =
                      annForm.classId === "ALL"
                        ? appData.students
                        : appData.students.filter(
                            (s) => s.classId === annForm.classId
                          );
                    targetLabel =
                      annForm.classId === "ALL"
                        ? "Toàn bộ các lớp"
                        : `Lớp ${annForm.classId}`;
                  }

                  const newAnn = {
                    id: "ANN_" + Date.now(),
                    title: annForm.title.trim(),
                    category: annForm.category,
                    academicYear: activeYear,
                    sendMode: annForm.sendMode,
                    classId: annForm.classId,
                    targetStudentId: annForm.targetStudentId,
                    targetLabel,
                    content: annForm.content.trim(),
                    attachmentName: annForm.attachmentName,
                    attachmentType: annForm.attachmentType,
                    attachmentDataUrl: annForm.attachmentDataUrl,
                    date: new Date().toLocaleString("vi-VN"),
                    recipientCount: recipients.length,
                  };

                  saveToAll({
                    ...appData,
                    announcements: [newAnn, ...(appData.announcements || [])],
                  });

                  setAnnForm({
                    ...annForm,
                    title: "",
                    content: "",
                    attachmentName: "",
                    attachmentType: "",
                    attachmentDataUrl: "",
                  });
                  notify("Đã đăng bản tin mới thành công!", "success");
                }}
                className="bg-white p-6 rounded-2xl border-2 border-[#1B3B48] space-y-4"
              >
                <h3 className="font-bold text-base text-[#1B3B48]">
                  ➕ Đăng Bản tin mới & Gửi thông báo cho Phụ huynh / Học sinh
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    value={annForm.title}
                    onChange={(e) =>
                      setAnnForm({ ...annForm, title: e.target.value })
                    }
                    placeholder="Tiêu đề bản tin..."
                    className="p-2.5 rounded-xl border text-xs"
                  />
                  <select
                    value={annForm.category}
                    onChange={(e) =>
                      setAnnForm({ ...annForm, category: e.target.value })
                    }
                    className="p-2.5 rounded-xl border text-xs bg-white font-bold"
                  >
                    {NEWS_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.badge} — {c.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={annForm.classId}
                    onChange={(e) =>
                      setAnnForm({ ...annForm, classId: e.target.value })
                    }
                    className="p-2.5 rounded-xl border text-xs bg-white font-bold"
                  >
                    <option value="ALL">Gửi toàn bộ các lớp</option>
                    {appData.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.id} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={3}
                  required
                  value={annForm.content}
                  onChange={(e) =>
                    setAnnForm({ ...annForm, content: e.target.value })
                  }
                  placeholder="Nội dung chi tiết thông báo..."
                  className="w-full p-3 rounded-xl border text-xs"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFlexibleFileUpload(e, (res) =>
                        setAnnForm((prev) => ({
                          ...prev,
                          attachmentName: res.fileName,
                          attachmentType: res.fileType,
                          attachmentDataUrl: res.dataUrl,
                        }))
                      )
                    }
                    className="text-xs"
                  />
                  <button
                    type="submit"
                    className="bg-[#1B3B48] text-[#E9C46A] px-5 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Đăng Bản Tin Lên Hệ Thống
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setNewsCategoryFilter("ALL")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                  newsCategoryFilter === "ALL"
                    ? "bg-[#1B3B48] text-white"
                    : "bg-white text-[#1B3B48] border"
                }`}
              >
                Tất cả bản tin
              </button>
              {NEWS_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNewsCategoryFilter(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                    newsCategoryFilter === cat.id
                      ? cat.activeBtn
                      : "bg-white text-[#1B3B48] border"
                  }`}
                >
                  {cat.badge}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {(appData.announcements || [])
                .filter((a) => {
                  if (!matchesSelectedYear(a.academicYear)) return false;
                  if (
                    newsCategoryFilter !== "ALL" &&
                    (a.category || "CLASS_NOTICE") !== newsCategoryFilter
                  )
                    return false;
                  if (currentUser.role === "student") {
                    if (
                      a.sendMode === "INDIVIDUAL" &&
                      a.targetStudentId &&
                      a.targetStudentId !== currentUser.studentId
                    )
                      return false;
                    if (
                      a.sendMode === "BULK" &&
                      a.classId !== "ALL" &&
                      a.classId !== currentUser.classId
                    )
                      return false;
                  }
                  return true;
                })
                .map((a) => {
                  const catMeta = getNewsCategoryMeta(
                    a.category || "CLASS_NOTICE"
                  );
                  return (
                    <div
                      key={a.id}
                      className="bg-white p-5 rounded-2xl border border-[#E2DFD7] shadow-sm space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${catMeta.color}`}
                          >
                            {catMeta.badge}
                          </span>
                          <span className="text-xs font-bold text-[#5C7667]">
                            {a.targetLabel || a.classId} • {a.date}
                          </span>
                        </div>
                        {currentUser.role === "teacher" && (
                          <button
                            onClick={() =>
                              saveToAll({
                                ...appData,
                                announcements: appData.announcements.filter(
                                  (x) => x.id !== a.id
                                ),
                              })
                            }
                            className="text-xs text-red-600 font-bold hover:underline"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-[#1B3B48]">
                        {a.title}
                      </h4>
                      <p className="text-xs text-[#1B3B48]/90 whitespace-pre-wrap leading-relaxed">
                        {a.content}
                      </p>
                      {(a.externalUrl || a.attachmentDataUrl) && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {a.externalUrl && (
                            <a
                              href={a.externalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-[#1B3B48] text-white text-xs font-bold"
                            >
                              🔗 Mở đường link đính kèm
                            </a>
                          )}
                          {a.attachmentDataUrl && (
                            <a
                              href={a.attachmentDataUrl}
                              download={a.attachmentName || "tailieu"}
                              className="px-3 py-1.5 rounded-xl bg-[#5C7667] text-white text-xs font-bold"
                            >
                              📥 Tải Tệp: {a.attachmentName || "Tài liệu"}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}


        {/* ============================================================ */}
        {/* MỤC 02: LỊCH HỌC TRỰC TUYẾN & ĐIỂM DANH CA HỌC ĐANG DIỄN RA  */}
        {/* ============================================================ */}
        {activeView === "calendar" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#9C6644] block mb-1">
                  MỤC 02 // REAL-TIME SCHEDULE & LIVE ATTENDANCE
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1B3B48]">
                  Lịch học Trực tuyến, Tạo lịch & Điểm danh Ca học Đang diễn ra
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {userRole === "teacher" && (
                  <button
                    onClick={() => setShowSlotManager(!showSlotManager)}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-[#EFECE6] text-[#1B3B48] hover:bg-[#E5E0D8] transition-colors border border-[#D5CFC4]"
                  >
                    ⚙ Quản lý Khung giờ ({timeSlots.length} ca)
                  </button>
                )}
                <button
                  onClick={() => setActiveView("home")}
                  className="text-sm text-[#5C7667] hover:text-[#1B3B48] font-medium px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white"
                >
                  ← Quay lại Trang chủ
                </button>
              </div>
            </div>

            {/* BANNER NỔI BẬT: CÁC LỚP HỌC ĐANG DIỄN RA NGAY LÚC NÀY (CHO PHÉP ĐIỂM DANH TRỰC TIẾP) */}
            {(() => {
              const liveEventsNow = calendarEvents.filter((ev) => {
                if (ev.type === "personal") return false;
                const st = getEventRealtimeStatus(ev, currentClock);
                return st?.code === "LIVE";
              });
              if (liveEventsNow.length === 0) return null;
              return (
                <div className="bg-emerald-950 text-white rounded-2xl p-5 shadow-lg border-2 border-emerald-400">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider mb-2">
                        🟢 ĐANG DIỄN RA NGAY LÚC NÀY ({liveEventsNow.length} CA HỌC)
                      </span>
                      <h3 className="text-lg font-serif font-bold">
                        Ca học đang trong khung giờ hoạt động — Có thể Điểm danh HS trực tiếp!
                      </h3>
                      <p className="text-xs text-emerald-200 mt-0.5">
                        Hệ thống tự động nhận diện ca học đang diễn ra theo giờ thực tế để giáo viên điểm danh ngay lập tức.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {liveEventsNow.map((ev) => {
                      const cls = classesList.find((c) => c.id === ev.classId);
                      return (
                        <div
                          key={ev.id}
                          className="bg-white/10 backdrop-blur-sm border border-emerald-400/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                                {ev.classId || `Khối ${ev.grade}`}
                              </span>
                              <span className="text-xs text-emerald-200 font-mono">
                                ⏰ {ev.startTime || "18:00"} - {ev.endTime || "19:30"} ({ev.dateISO})
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-white mt-1">{ev.title}</h4>
                            {cls && (
                              <p className="text-[11px] text-emerald-200 mt-0.5">
                                Lớp: {cls.name} • Sĩ số: {students.filter((s) => s.classId === cls.id).length} HS
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ev.meetLink && (
                              <a
                                href={ev.meetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 rounded-lg bg-white text-emerald-950 text-xs font-bold hover:bg-emerald-100"
                              >
                                🎥 Vào phòng học
                              </a>
                            )}
                            {userRole === "teacher" && (
                              <button
                                onClick={() => openAttendanceFromCalendarEvent(ev)}
                                className="px-3.5 py-2 rounded-lg bg-[#E9C46A] text-[#1B3B48] text-xs font-bold hover:bg-[#f0d182] shadow"
                              >
                                ✓ Điểm danh HS ngay
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Thanh điều hướng tuần & Đồng hồ thời gian thực */}
            <div className="bg-white rounded-2xl p-4 border border-[#E5E0D8] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block">
                    ĐỒNG HỒ THỜI GIAN THỰC (REAL-TIME CLOCK)
                  </span>
                  <span className="text-sm font-bold text-[#1B3B48]">
                    {currentClock.toLocaleTimeString("vi-VN")} —{" "}
                    {currentClock.toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedWeekOffset((w) => w - 1)}
                  className="px-3 py-1.5 rounded-lg border border-[#D5CFC4] text-xs font-semibold hover:bg-[#EFECE6]"
                >
                  ◀ Tuần trước
                </button>
                <button
                  onClick={() => setSelectedWeekOffset(0)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold ${
                    selectedWeekOffset === 0
                      ? "bg-[#1B3B48] text-white"
                      : "bg-[#EFECE6] text-[#1B3B48] hover:bg-[#E5E0D8]"
                  }`}
                >
                  Hôm nay (Tuần hiện tại)
                </button>
                <button
                  onClick={() => setSelectedWeekOffset((w) => w + 1)}
                  className="px-3 py-1.5 rounded-lg border border-[#D5CFC4] text-xs font-semibold hover:bg-[#EFECE6]"
                >
                  Tuần sau ▶
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-600">Lọc lớp:</span>
                <select
                  value={calendarFilterClass}
                  onChange={(e) => setCalendarFilterClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#D5CFC4] text-xs bg-[#F7F6F2] font-semibold text-[#1B3B48]"
                >
                  <option value="ALL">Tất cả các lớp ({classesList.length})</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quản lý khung giờ tùy chỉnh */}
            {showSlotManager && userRole === "teacher" && (
              <div className="bg-[#EFECE6] rounded-2xl p-5 border border-[#D5CFC4]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif font-bold text-[#1B3B48] text-sm">
                    ⚙ Quản lý Khung giờ Ca học (Giáo viên tự thêm/xóa ca học)
                  </h4>
                  <button
                    onClick={() => setShowSlotManager(false)}
                    className="text-xs text-stone-500 hover:text-stone-800"
                  >
                    Đóng ✕
                  </button>
                </div>
                <form onSubmit={handleAddTimeSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                  <input
                    type="text"
                    required
                    placeholder="Tên ca (VD: Ca Tối 2: 19h45 - 21h15)"
                    value={newSlotForm.label}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, label: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] text-xs bg-white"
                  />
                  <input
                    type="time"
                    required
                    value={newSlotForm.startTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, startTime: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] text-xs bg-white"
                  />
                  <input
                    type="time"
                    required
                    value={newSlotForm.endTime}
                    onChange={(e) => setNewSlotForm({ ...newSlotForm, endTime: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] text-xs bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#1B3B48] text-white text-xs font-bold hover:bg-[#2C4A3E]"
                  >
                    + Thêm Khung Giờ
                  </button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((sl) => (
                    <div
                      key={sl.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#D5CFC4] text-xs"
                    >
                      <span className="font-semibold text-[#1B3B48]">{sl.label}</span>
                      <span className="text-stone-400 font-mono">
                        ({sl.startTime}-{sl.endTime})
                      </span>
                      <button
                        onClick={() => handleDeleteTimeSlot(sl.id)}
                        className="text-red-500 hover:text-red-700 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FORM TẠO LỊCH HỌC MỚI + TÍCH HỢP ĐIỂM DANH TRỰC TIẾP NGAY LÚC TẠO LỊCH */}
            <div className="bg-[#EFECE6] rounded-2xl p-6 border border-[#D5CFC4]">
              <h3 className="font-serif font-bold text-[#1B3B48] mb-3 text-lg">
                {userRole === "teacher"
                  ? "➕ Tạo Ca học Mới & Điểm danh Học sinh Trực tiếp lúc Tạo lịch"
                  : "➕ Thêm Lịch Ôn tập Cá nhân (Chỉ mình em thấy)"}
              </h3>
              <form onSubmit={handleAddCalendarEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <select
                    value={calForm.day}
                    onChange={(e) => {
                      const newDay = e.target.value;
                      const foundDay = weekDatesList.find((d) => d.dayName === newDay);
                      setCalForm({
                        ...calForm,
                        day: newDay,
                        dateISO: foundDay ? foundDay.dateISO : calForm.dateISO,
                      });
                    }}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white text-xs font-semibold"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={calForm.dateISO}
                    onChange={(e) => setCalForm({ ...calForm, dateISO: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white text-xs font-mono"
                  />

                  <select
                    value={calForm.slotId}
                    onChange={(e) => {
                      const sl = timeSlots.find((s) => s.id === e.target.value);
                      setCalForm({
                        ...calForm,
                        slotId: e.target.value,
                        startTime: sl ? sl.startTime : calForm.startTime,
                        endTime: sl ? sl.endTime : calForm.endTime,
                      });
                    }}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white text-xs font-semibold md:col-span-2"
                  >
                    {timeSlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 md:col-span-2">
                    <input
                      type="time"
                      value={calForm.startTime}
                      onChange={(e) => setCalForm({ ...calForm, startTime: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg border border-[#D5CFC4] bg-white text-xs font-mono"
                      title="Giờ bắt đầu"
                    />
                    <span className="text-xs text-stone-500">→</span>
                    <input
                      type="time"
                      value={calForm.endTime}
                      onChange={(e) => setCalForm({ ...calForm, endTime: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg border border-[#D5CFC4] bg-white text-xs font-mono"
                      title="Giờ kết thúc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  {userRole === "teacher" && (
                    <>
                      <select
                        value={calForm.grade}
                        onChange={(e) => setCalForm({ ...calForm, grade: Number(e.target.value) })}
                        className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white text-xs font-bold text-[#1B3B48]"
                      >
                        <option value={10}>Khối 10</option>
                        <option value={11}>Khối 11</option>
                        <option value={12}>Khối 12</option>
                      </select>

                      <select
                        value={calForm.classId}
                        onChange={(e) => {
                          const cid = e.target.value;
                          const foundCls = classesList.find((c) => c.id === cid);
                          setCalForm({
                            ...calForm,
                            classId: cid,
                            grade: foundCls ? foundCls.grade : calForm.grade,
                          });
                          if (calFormIncludeAttendance) {
                            initCalFormAttendanceForClass(cid);
                          }
                        }}
                        className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white text-xs font-bold text-[#9C6644]"
                      >
                        <option value="ALL">Tất cả lớp thuộc Khối</option>
                        {classesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            Lớp {c.id} ({c.name})
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  <input
                    type="text"
                    required
                    placeholder="Nội dung ca học (VD: Chuyên đề Ester - Lipid / Giải đề thi thử)"
                    value={calForm.title}
                    onChange={(e) => setCalForm({ ...calForm, title: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white text-xs md:col-span-2"
                  />

                  {userRole === "teacher" && (
                    <input
                      type="url"
                      placeholder="Link Google Meet / Zoom (nếu có)..."
                      value={calForm.meetLink}
                      onChange={(e) => setCalForm({ ...calForm, meetLink: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white text-xs"
                    />
                  )}

                  <button
                    type="submit"
                    className="bg-[#1B3B48] text-white rounded-lg px-4 py-2 text-xs font-bold hover:bg-[#2C4A3E] transition-colors shadow-sm"
                  >
                    {calFormIncludeAttendance && userRole === "teacher"
                      ? "✓ Lưu Lịch & Lưu Điểm Danh"
                      : "+ Lưu vào Lịch Tuần"}
                  </button>
                </div>

                {/* TÙY CHỌN: BẬT ĐIỂM DANH HỌC SINH NGAY TRONG LÚC TẠO LỊCH (KHI LỚP ĐANG DIỄN RA) */}
                {userRole === "teacher" && (
                  <div className="pt-2 border-t border-[#D5CFC4]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={calFormIncludeAttendance}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setCalFormIncludeAttendance(checked);
                            if (checked) {
                              const targetCid =
                                calForm.classId && calForm.classId !== "ALL"
                                  ? calForm.classId
                                  : classesList.find((c) => c.grade === Number(calForm.grade))?.id ||
                                    classesList[0]?.id ||
                                    "";
                              if (targetCid) {
                                if (calForm.classId === "ALL") {
                                  setCalForm((prev) => ({ ...prev, classId: targetCid }));
                                }
                                initCalFormAttendanceForClass(targetCid);
                              }
                            }
                          }}
                          className="w-4 h-4 accent-[#1B3B48] rounded"
                        />
                        <span className="text-xs font-bold text-[#1B3B48]">
                          🟢 Điểm danh Học sinh ngay lúc tạo lịch này (Dành cho lớp đang diễn ra)
                        </span>
                      </label>
                      {calFormIncludeAttendance && (
                        <span className="text-[11px] text-[#2C4A3E] font-medium">
                          Khi bấm lưu lịch, hệ thống sẽ tự động lưu phiếu điểm danh và cập nhật tỷ lệ chuyên cần của từng HS.
                        </span>
                      )}
                    </div>

                    {calFormIncludeAttendance && (
                      <div className="mt-3 bg-white rounded-xl p-4 border border-[#D5CFC4]">
                        {(!calForm.classId || calForm.classId === "ALL") ? (
                          <p className="text-xs text-amber-700 font-medium">
                            ⚠ Vui lòng chọn một lớp cụ thể ở ô "Lớp" phía trên để hiển thị danh sách học sinh cần điểm danh.
                          </p>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                              <span className="text-xs font-bold text-[#1B3B48]">
                                Danh sách điểm danh Lớp {calForm.classId} ({calFormAttendanceRecords.length} học sinh)
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCalFormAttendanceRecords((prev) =>
                                      prev.map((r) => ({ ...r, status: "present" }))
                                    )
                                  }
                                  className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold hover:bg-emerald-200"
                                >
                                  ✓ Tất cả Có mặt
                                </button>
                              </div>
                            </div>
                            {calFormAttendanceRecords.length === 0 ? (
                              <p className="text-xs text-stone-500 italic">
                                Lớp {calForm.classId} hiện chưa có học sinh nào.
                              </p>
                            ) : (
                              <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-lg">
                                {calFormAttendanceRecords.map((rec, idx) => (
                                  <div
                                    key={rec.studentId}
                                    className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white hover:bg-stone-50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-mono text-stone-400 w-5">
                                        {idx + 1}.
                                      </span>
                                      <span className="text-xs font-bold text-[#1B3B48]">
                                        {rec.studentName}
                                      </span>
                                      <span className="text-[10px] font-mono text-stone-400">
                                        ({rec.studentId})
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {(
                                        [
                                          ["present", "✓ Có mặt", "bg-emerald-600 text-white"],
                                          ["late", "⏰ Đi muộn", "bg-amber-500 text-white"],
                                          ["excused", "📩 Có phép", "bg-sky-600 text-white"],
                                          ["unexcused", "✕ Không phép", "bg-red-600 text-white"],
                                        ] as const
                                      ).map(([stKey, stLabel, activeCls]) => (
                                        <button
                                          key={stKey}
                                          type="button"
                                          onClick={() => {
                                            const next = [...calFormAttendanceRecords];
                                            next[idx] = { ...next[idx], status: stKey };
                                            setCalFormAttendanceRecords(next);
                                          }}
                                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                                            rec.status === stKey
                                              ? activeCls
                                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                          }`}
                                        >
                                          {stLabel}
                                        </button>
                                      ))}
                                      <input
                                        type="text"
                                        placeholder="Ghi chú..."
                                        value={rec.note}
                                        onChange={(e) => {
                                          const next = [...calFormAttendanceRecords];
                                          next[idx] = { ...next[idx], note: e.target.value };
                                          setCalFormAttendanceRecords(next);
                                        }}
                                        className="px-2 py-1 rounded border border-stone-200 text-[11px] w-28"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* BẢNG THỜI KHÓA BIỂU 7 NGÀY TRONG TUẦN */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-[#1B3B48] text-[#F7F6F2] text-xs font-mono uppercase">
                      <th className="p-3.5 border-r border-[#2C4A3E] w-44">Khung giờ / Ca học</th>
                      {weekDatesList.map((wd) => (
                        <th
                          key={wd.dayName}
                          className={`p-3 border-r border-[#2C4A3E] text-center ${
                            wd.isToday ? "bg-[#2C4A3E] text-[#E9C46A]" : ""
                          }`}
                        >
                          <div className="font-bold">{wd.dayName}</div>
                          <div className="text-[11px] opacity-80 font-mono mt-0.5">
                            {wd.shortLabel} {wd.isToday ? "• HÔM NAY" : ""}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8] text-xs">
                    {timeSlots.map((slot) => (
                      <tr key={slot.id} className="hover:bg-[#F7F6F2]/50">
                        <td className="p-3.5 font-mono font-semibold text-[#1B3B48] bg-[#EFECE6]/50 border-r border-[#E5E0D8] align-top">
                          <div className="font-bold text-xs">{slot.label}</div>
                          <div className="text-[11px] text-[#9C6644] mt-1">
                            ⏰ {slot.startTime} - {slot.endTime}
                          </div>
                        </td>
                        {weekDatesList.map((wd) => {
                          const cellEvents = calendarEvents.filter((ev) => {
                            if (ev.slotId !== slot.id || ev.day !== wd.dayName) return false;
                            if (ev.dateISO && ev.dateISO !== wd.dateISO) return false;
                            if (
                              userRole === "student" &&
                              ev.type === "personal" &&
                              ev.ownerId !== currentStudentId
                            ) {
                              return false;
                            }
                            if (
                              calendarFilterClass !== "ALL" &&
                              ev.classId &&
                              ev.classId !== "ALL" &&
                              ev.classId !== calendarFilterClass
                            ) {
                              return false;
                            }
                            return true;
                          });
                          return (
                            <td
                              key={wd.dayName}
                              className={`p-2 border-r border-[#E5E0D8] align-top h-32 ${
                                wd.isToday ? "bg-amber-50/20" : ""
                              }`}
                            >
                              <div className="space-y-2">
                                {cellEvents.map((ev) => {
                                  const liveStatus = getEventRealtimeStatus(ev, currentClock);
                                  const isLive = liveStatus?.code === "LIVE";
                                  return (
                                    <div
                                      key={ev.id}
                                      className={`p-2.5 rounded-xl border transition-all relative group ${
                                        isLive
                                          ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/50 shadow-sm"
                                          : ev.type === "personal"
                                          ? "bg-amber-50/80 border-amber-300 text-amber-900"
                                          : ev.grade === 12
                                          ? "bg-[#1B3B48]/10 border-[#1B3B48]/30 text-[#1B3B48]"
                                          : ev.grade === 11
                                          ? "bg-[#2C4A3E]/10 border-[#2C4A3E]/30 text-[#2C4A3E]"
                                          : "bg-[#9C6644]/10 border-[#9C6644]/30 text-[#9C6644]"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/80">
                                          {ev.type === "personal"
                                            ? "Cá nhân"
                                            : ev.classId && ev.classId !== "ALL"
                                            ? ev.classId
                                            : `Khối ${ev.grade}`}
                                        </span>
                                        {(userRole === "teacher" ||
                                          (ev.type === "personal" &&
                                            ev.ownerId === currentStudentId)) && (
                                          <div className="flex items-center gap-1">
                                            {userRole === "teacher" && ev.type === "class" && (
                                              <button
                                                onClick={() => setEditingCalEvent({ ...ev })}
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-white/90 text-[#1B3B48] hover:bg-[#1B3B48] hover:text-white font-semibold"
                                                title="Chỉnh sửa ca học"
                                              >
                                                Sửa
                                              </button>
                                            )}
                                            <button
                                              onClick={() => handleDeleteEvent(ev.id)}
                                              className="text-red-500 hover:text-red-700 font-bold px-1"
                                              title="Xóa lịch"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      <div className="font-bold leading-snug text-xs mb-1">
                                        {ev.title}
                                      </div>

                                      <div className="text-[10px] font-mono text-stone-500 mb-1">
                                        ⏰ {ev.startTime || slot.startTime} -{" "}
                                        {ev.endTime || slot.endTime}
                                      </div>

                                      {liveStatus && (
                                        <div
                                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${liveStatus.badgeClass}`}
                                        >
                                          {liveStatus.label}
                                        </div>
                                      )}

                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {ev.meetLink && (
                                          <a
                                            href={ev.meetLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-[#2C4A3E] text-white hover:bg-[#1B3B48]"
                                          >
                                            🎥 Phòng học
                                          </a>
                                        )}
                                        {/* NÚT ĐIỂM DANH HỌC SINH TRỰC TIẾP TRÊN CA HỌC */}
                                        {userRole === "teacher" && ev.type === "class" && (
                                          <button
                                            type="button"
                                            onClick={() => openAttendanceFromCalendarEvent(ev)}
                                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                                              isLive
                                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow"
                                                : "bg-[#E9C46A]/40 text-[#1B3B48] hover:bg-[#E9C46A]"
                                            }`}
                                          >
                                            {isLive ? "🟢 Điểm danh HS (Đang học)" : "✓ Điểm danh HS"}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL CHỈNH SỬA CA HỌC (KÈM NÚT MỞ ĐIỂM DANH TRỰC TIẾP) */}
            {editingCalEvent && userRole === "teacher" && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#F7F6F2] border border-[#D5CFC4] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3 mb-4">
                    <h3 className="font-serif font-bold text-lg text-[#1B3B48]">
                      ✎ Chỉnh sửa Ca học & Điểm danh
                    </h3>
                    <button
                      onClick={() => setEditingCalEvent(null)}
                      className="text-stone-400 hover:text-stone-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleSaveEditedCalEvent} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-600 mb-1">Thứ</label>
                        <select
                          value={editingCalEvent.day}
                          onChange={(e) =>
                            setEditingCalEvent({ ...editingCalEvent, day: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                        >
                          {DAYS_OF_WEEK.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-600 mb-1">Ngày học</label>
                        <input
                          type="date"
                          value={editingCalEvent.dateISO || ""}
                          onChange={(e) =>
                            setEditingCalEvent({ ...editingCalEvent, dateISO: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-600 mb-1">
                          Giờ bắt đầu
                        </label>
                        <input
                          type="time"
                          value={editingCalEvent.startTime || "18:00"}
                          onChange={(e) =>
                            setEditingCalEvent({ ...editingCalEvent, startTime: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-600 mb-1">
                          Giờ kết thúc
                        </label>
                        <input
                          type="time"
                          value={editingCalEvent.endTime || "19:30"}
                          onChange={(e) =>
                            setEditingCalEvent({ ...editingCalEvent, endTime: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-stone-600 mb-1">Khối</label>
                        <select
                          value={editingCalEvent.grade}
                          onChange={(e) =>
                            setEditingCalEvent({
                              ...editingCalEvent,
                              grade: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                        >
                          <option value={10}>Khối 10</option>
                          <option value={11}>Khối 11</option>
                          <option value={12}>Khối 12</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-600 mb-1">Mã Lớp</label>
                        <select
                          value={editingCalEvent.classId || "ALL"}
                          onChange={(e) =>
                            setEditingCalEvent({ ...editingCalEvent, classId: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                        >
                          <option value="ALL">Tất cả lớp trong Khối</option>
                          {classesList.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.id} - {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">
                        Tiêu đề / Nội dung buổi học
                      </label>
                      <input
                        type="text"
                        required
                        value={editingCalEvent.title}
                        onChange={(e) =>
                          setEditingCalEvent({ ...editingCalEvent, title: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-600 mb-1">
                        Link phòng học (Google Meet / Zoom)
                      </label>
                      <input
                        type="url"
                        value={editingCalEvent.meetLink || ""}
                        onChange={(e) =>
                          setEditingCalEvent({ ...editingCalEvent, meetLink: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                      />
                    </div>

                    <div className="pt-3 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const ev = editingCalEvent;
                          setEditingCalEvent(null);
                          openAttendanceFromCalendarEvent(ev);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                      >
                        ✓ Điểm danh HS ca học này
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCalEvent(null)}
                          className="px-4 py-2 rounded-lg border border-[#D5CFC4] text-stone-600 font-semibold"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E]"
                        >
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MỤC 03: CHƯƠNG TRÌNH HỌC (HÓA 10, 11, 12 - CHUẨN IUPAC)      */}
        {/* ============================================================ */}
        {activeView === "curriculum" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#9C6644] block mb-1">
                  MỤC 03 // CURRICULUM & YCCĐ (GDPT 2018 - DANH PHÁP IUPAC)
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1B3B48]">
                  Khung Chương trình Hóa học 10 • 11 • 12 & Học liệu từng Chương
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {[10, 11, 12].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGradeTab(g as 10 | 11 | 12)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedGradeTab === g
                        ? "bg-[#1B3B48] text-white shadow-sm"
                        : "bg-[#EFECE6] text-[#1B3B48] hover:bg-[#E5E0D8]"
                    }`}
                  >
                    Hóa học {g}
                  </button>
                ))}
                <button
                  onClick={() => setActiveView("home")}
                  className="text-sm text-[#5C7667] hover:text-[#1B3B48] font-medium px-3 py-2"
                >
                  ← Trang chủ
                </button>
              </div>
            </div>

            {userRole === "teacher" && (
              <div className="flex justify-end">
                <button
                  onClick={() =>
                    setNewChapterForm({
                      grade: selectedGradeTab,
                      code: `C${curriculumData[selectedGradeTab].length + 1}-${selectedGradeTab}`,
                      title: "",
                       lessons: "",
                      yccdText: "",
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-[#2C4A3E] text-white text-xs font-bold hover:bg-[#1B3B48]"
                >
                  + Thêm Chương mới cho Khối {selectedGradeTab}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {curriculumData[selectedGradeTab].map((chap) => {
                const chapDocs = documents.filter(
                  (d) => d.grade === selectedGradeTab && d.chapter === chap.title
                );
                return (
                  <div
                    key={chap.code}
                    className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#1B3B48]/10 text-[#1B3B48]">
                          {chap.code}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#9C6644] font-semibold">
                            {chap.lessons}
                          </span>
                          {userRole === "teacher" && (
                            <>
                              <button
                                onClick={() =>
                                  setEditingChapter({
                                    grade: selectedGradeTab,
                                    code: chap.code,
                                    title: chap.title,
                                    lessons: chap.lessons,
                                    yccdText: chap.yccd.join("\\n"),
                                  })
                                }
                                className="text-xs px-2 py-0.5 rounded bg-[#EFECE6] text-[#1B3B48] hover:bg-[#1B3B48] hover:text-white font-semibold"
                              >
                                ✎ Sửa
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCurriculumChapter(selectedGradeTab, chap.code)
                                }
                                className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 font-semibold"
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-serif font-bold text-[#1B3B48] mb-3">
                        {chap.title}
                      </h3>

                      <div className="bg-[#F7F6F2] rounded-xl p-3.5 border border-[#E5E0D8] mb-4">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#2C4A3E] font-bold block mb-1.5">
                          🎯 Yêu cầu cần đạt (YCCĐ):
                        </span>
                        <ul className="space-y-1 text-xs text-stone-700 list-disc list-inside">
                          {chap.yccd.map((item, i) => (
                            <li key={i} className="leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="border-t border-[#E5E0D8] pt-3 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#1B3B48]">
                          📂 Tài liệu Chương này ({chapDocs.length})
                        </span>
                        {userRole === "teacher" && (
                          <button
                            onClick={() =>
                              setChapterDocForm({
                                grade: selectedGradeTab,
                                chapterTitle: chap.title,
                                title: "",
                                type: "PDF Chuyên đề",
                                size: "2.0 MB",
                                url: "",
                                fileName: "",
                                fileDataUrl: "",
                              })
                            }
                            className="text-[11px] font-bold text-[#9C6644] hover:underline"
                          >
                            + Tải tài liệu vào chương
                          </button>
                        )}
                      </div>
                      {chapDocs.length === 0 ? (
                        <p className="text-xs text-stone-400 italic">
                          Chưa có tài liệu đính kèm riêng cho chương này.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {chapDocs.map((d) => (
                            <div
                              key={d.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-[#EFECE6]/60 text-xs"
                            >
                              <span className="font-medium text-[#1B3B48] truncate max-w-[220px]">
                                📄 {d.title}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {d.url && d.url !== "#" && (
                                  <a
                                    href={d.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 rounded bg-[#1B3B48] text-white text-[10px] font-semibold"
                                  >
                                    Mở
                                  </a>
                                )}
                                {d.fileDataUrl && (
                                  <a
                                    href={d.fileDataUrl}
                                    download={d.fileName || d.title}
                                    className="px-2 py-0.5 rounded bg-[#2C4A3E] text-white text-[10px] font-semibold"
                                  >
                                    Tải
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MỤC 04: THEO DÕI TIẾN ĐỘ HỌC TẬP & HỒ SƠ HỌC SINH            */}
        {/* ============================================================ */}
        {activeView === "progress" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#9C6644] block mb-1">
                  MỤC 04 // STUDENT ACADEMIC PROGRESS & REPORT
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1B3B48]">
                  Hồ sơ Năng lực, Điểm số & Nhận xét Học sinh
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {userRole === "teacher" && (
                  <select
                    value={selectedStudent.id}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-[#D5CFC4] bg-white text-xs font-bold text-[#1B3B48]"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.classId}] {s.name} ({s.id}) — ĐTB: {s.score}
                      </option>
                    ))}
                  </select>
                )}
                {userRole === "teacher" && selectedStudent && (
                  <button
                    onClick={() => setEditingStudentModal({ ...selectedStudent, originalId: selectedStudent.id })}
                    className="px-3.5 py-2 rounded-xl bg-[#E9C46A] text-[#1B3B48] text-xs font-bold hover:bg-[#f0d182] shadow-sm"
                  >
                    ✎ Sửa thông tin HS này
                  </button>
                )}
                <button
                  onClick={() => setActiveView("home")}
                  className="text-sm text-[#5C7667] hover:text-[#1B3B48] font-medium px-3 py-2"
                >
                  ← Trang chủ
                </button>
              </div>
            </div>

            {/* 4 Thẻ chỉ số học tập của Học sinh đang chọn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-sm">
                <span className="text-[11px] font-mono uppercase text-stone-400 block">
                  HỌC SINH & LỚP HỌC
                </span>
                <h3 className="text-lg font-serif font-bold text-[#1B3B48] mt-1">
                  {selectedStudent.name}
                </h3>
                <p className="text-xs text-[#9C6644] font-semibold mt-1">
                  Mã HS: {selectedStudent.id} • Lớp: {selectedStudent.classId} (Khối{" "}
                  {selectedStudent.grade})
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  🎯 Mục tiêu: {selectedStudent.universityGoal} ({selectedStudent.targetScore}+)
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-sm">
                <span className="text-[11px] font-mono uppercase text-stone-400 block">
                  ĐIỂM TRUNG BÌNH HÓA HỌC
                </span>
                <div className="text-3xl font-serif font-bold text-[#1B3B48] mt-1">
                  {selectedStudent.score.toFixed(1)}{" "}
                  <span className="text-sm font-normal text-stone-400">/ 10</span>
                </div>
                <p className="text-xs text-emerald-700 font-medium mt-1">
                  Tự động đồng bộ từ Điểm KT trên lớp & Bài tập
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-sm">
                <span className="text-[11px] font-mono uppercase text-stone-400 block">
                  TỶ LỆ CHUYÊN CẦN
                </span>
                <div className="text-3xl font-serif font-bold text-[#2C4A3E] mt-1">
                  {selectedStudent.attendanceRate}%
                </div>
                <p className="text-xs text-stone-600 mt-1 line-clamp-1">
                  {selectedStudent.attendanceNote}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-sm">
                <span className="text-[11px] font-mono uppercase text-stone-400 block">
                  ĐIỂM TÍCH CỰC (GÓC HÓA HỌC)
                </span>
                <div className="text-3xl font-serif font-bold text-[#9C6644] mt-1">
                  {selectedStudent.engagementPoints || 0}{" "}
                  <span className="text-xs font-normal text-stone-500">pts</span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Chuỗi học tập: 🔥 {selectedStudent.streakDays || 1} ngày liên tiếp
                </p>
              </div>
            </div>

            {/* Bảng lịch sử bài kiểm tra & nhận xét của Giáo viên */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm">
                <h3 className="font-serif font-bold text-lg text-[#1B3B48] mb-4">
                  📊 Lịch sử Điểm Bài Kiểm tra & Bài Tập ({selectedStudent.inClassTests.length})
                </h3>

                {userRole === "teacher" && (
                  <form
                    onSubmit={handleAddInClassTest}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 bg-[#EFECE6] p-3.5 rounded-xl mb-4 text-xs"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Tên bài KT / Bài tập..."
                      value={testForm.testName}
                      onChange={(e) => setTestForm({ ...testForm, testName: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white sm:col-span-2"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      placeholder="Điểm (0-10)"
                      value={testForm.score}
                      onChange={(e) => setTestForm({ ...testForm, score: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Nhận xét ngắn..."
                      value={testForm.note}
                      onChange={(e) => setTestForm({ ...testForm, note: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E]"
                    >
                      + Vào điểm
                    </button>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#EFECE6] text-[#1B3B48] font-mono uppercase">
                        <th className="p-3">Ngày</th>
                        <th className="p-3">Bài kiểm tra / Bài tập</th>
                        <th className="p-3">Điểm số</th>
                        <th className="p-3">Nhận xét của Giáo viên</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E0D8]">
                      {selectedStudent.inClassTests.map((t) => (
                        <tr key={t.id} className="hover:bg-stone-50">
                          <td className="p-3 font-mono text-stone-500">{t.date}</td>
                          <td className="p-3 font-bold text-[#1B3B48]">{t.testName}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-full font-bold bg-[#1B3B48] text-[#E9C46A]">
                              {t.score} / {t.maxScore}
                            </span>
                          </td>
                          <td className="p-3 text-stone-600">{t.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1B3B48] mb-3">
                    📝 Đánh giá Chuyên cần & Nhận xét Học lực
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#E5E0D8]">
                      <span className="font-mono text-[10px] uppercase text-stone-400 block mb-1">
                        THÁI ĐỘ HỌC TẬP
                      </span>
                      <p className="font-semibold text-[#1B3B48]">{selectedStudent.attitude}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#E5E0D8]">
                      <span className="font-mono text-[10px] uppercase text-stone-400 block mb-1">
                        NHẬN XÉT TỔNG HỢP CỦA GIÁO VIÊN
                      </span>
                      <p className="text-stone-700 leading-relaxed">
                        {selectedStudent.teacherComment}
                      </p>
                    </div>
                  </div>
                </div>

                {userRole === "teacher" && (
                  <div className="mt-6 pt-4 border-t border-[#E5E0D8] space-y-2">
                    <button
                      onClick={() => setEditingStudentModal({ ...selectedStudent, originalId: selectedStudent.id })}
                      className="w-full py-2.5 rounded-xl bg-[#EFECE6] text-[#1B3B48] text-xs font-bold hover:bg-[#E5E0D8]"
                    >
                      ✎ Chỉnh sửa Hồ sơ / Nhận xét Học sinh
                    </button>
                    <button
                      onClick={() => {
                        const mail = buildStudentReportEmail(selectedStudent);
                        setEmailPreviewModal({
                          to: selectedStudent.email,
                          subject: mail.subject,
                          body: mail.body,
                        });
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#1B3B48] text-white text-xs font-bold hover:bg-[#2C4A3E]"
                    >
                      ✉ Gửi Phiếu Báo Cáo Học Tập qua Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MỤC 05A: KHO TÀI LIỆU LỚP / CHƯƠNG (ĐÃ TÁCH RIÊNG)           */}
        {/* ============================================================ */}
        {activeView === "documents" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#9C6644] block mb-1">
                  MỤC 05A // STUDY MATERIALS REPOSITORY (TÁCH RIÊNG KHO TÀI LIỆU)
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1B3B48]">
                  Kho Tài liệu Lớp / Chương (Tải Tài liệu Riêng)
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveView("homeworks")}
                  className="px-4 py-2 rounded-xl bg-[#9C6644] text-white text-xs font-bold hover:bg-[#7d5035] shadow-sm"
                >
                  📝 Chuyển sang Mục 05B: Giao Bài Tập & Nộp Bài →
                </button>
                <button
                  onClick={() => setActiveView("home")}
                  className="text-sm text-[#5C7667] hover:text-[#1B3B48] font-medium px-3 py-2"
                >
                  ← Trang chủ
                </button>
              </div>
            </div>

            {/* FORM GIÁO VIÊN TẢI TÀI LIỆU MỚI LÊN KHO */}
            {userRole === "teacher" && (
              <div className="bg-[#EFECE6] rounded-2xl p-6 border border-[#D5CFC4]">
                <h3 className="font-serif font-bold text-lg text-[#1B3B48] mb-3">
                  📂 Tải Tài liệu / Chuyên đề Mới lên Kho Học Liệu (Đồng bộ Mục 01 & Mục 03)
                </h3>
                <form onSubmit={handleUploadDocInModule05} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select
                      value={docUploadForm.grade}
                      onChange={(e) => {
                        const g = Number(e.target.value) as 10 | 11 | 12;
                        setDocUploadForm({
                          ...docUploadForm,
                          grade: g,
                          chapter: curriculumData[g]?.[0]?.title || "",
                        });
                      }}
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold text-[#1B3B48]"
                    >
                      <option value={10}>Khối 10</option>
                      <option value={11}>Khối 11</option>
                      <option value={12}>Khối 12</option>
                    </select>

                    <select
                      value={docUploadForm.classId}
                      onChange={(e) =>
                        setDocUploadForm({ ...docUploadForm, classId: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold text-[#9C6644]"
                    >
                      <option value="ALL">Tất cả các lớp thuộc Khối</option>
                      {classesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          Lớp {c.id} - {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={docUploadForm.chapter}
                      onChange={(e) =>
                        setDocUploadForm({ ...docUploadForm, chapter: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white md:col-span-2"
                    >
                      {(curriculumData[docUploadForm.grade as 10 | 11 | 12] || []).map((c) => (
                        <option key={c.code} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Tên tài liệu (VD: Chuyên đề Ester - Lipid chuẩn IUPAC)..."
                      value={docUploadForm.title}
                      onChange={(e) =>
                        setDocUploadForm({ ...docUploadForm, title: e.target.value })
                      }
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white md:col-span-2"
                    />
                    <select
                      value={docUploadForm.type}
                      onChange={(e) => setDocUploadForm({ ...docUploadForm, type: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                    >
                      <option value="PDF Chuyên đề">PDF Chuyên đề</option>
                      <option value="Phiếu Bài Tập">Phiếu Bài Tập</option>
                      <option value="Sơ đồ tư duy">Sơ đồ tư duy</option>
                      <option value="Video Bài Giảng">Video Bài Giảng</option>
                    </select>
                    <input
                      type="url"
                      placeholder="Link Google Drive / PDF ngoài (Khuyên dùng)..."
                      value={docUploadForm.url}
                      onChange={(e) => setDocUploadForm({ ...docUploadForm, url: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-white border border-[#D5CFC4] cursor-pointer hover:bg-stone-50 font-semibold text-[#1B3B48]">
                        📎 Đính kèm tệp trực tiếp (&lt;600KB hoặc Ảnh)
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              handleFlexibleFileUpload(f, (res) => {
                                setDocUploadForm((prev) => ({
                                  ...prev,
                                  fileName: res.fileName,
                                  fileDataUrl: res.dataUrl,
                                  size: res.sizeLabel,
                                }));
                              });
                            }
                          }}
                        />
                      </label>
                      {docUploadForm.fileName && (
                        <span className="text-emerald-700 font-semibold">
                          ✓ Đã chọn: {docUploadForm.fileName} ({docUploadForm.size})
                        </span>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E] shadow-sm"
                    >
                      + Đăng Tài Liệu Lên Kho
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* BỘ LỌC TÀI LIỆU */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E0D8]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1B3B48]">Lọc theo Lớp:</span>
                <select
                  value={docFilterClass}
                  onChange={(e) => setDocFilterClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#D5CFC4] text-xs font-semibold bg-[#F7F6F2]"
                >
                  <option value="ALL">Tất cả các lớp</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.id} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-xs text-stone-500 font-mono">
                Tổng số: {documents.length} tài liệu học tập
              </span>
            </div>

            {/* DANH SÁCH THẺ TÀI LIỆU */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents
                .filter(
                  (d) =>
                    docFilterClass === "ALL" ||
                    !d.classId ||
                    d.classId === "ALL" ||
                    d.classId === docFilterClass
                )
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-sm flex flex-col justify-between hover:border-[#5C7667] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1B3B48]/10 text-[#1B3B48]">
                          Khối {doc.grade} • {doc.classId === "ALL" ? "Mọi lớp" : doc.classId}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-mono text-stone-400">
                            {doc.updatedAt}
                          </span>
                          {userRole === "teacher" && (
                            <>
                              <button
                                onClick={() => setEditingDocModal({ ...doc })}
                                className="text-[11px] px-2 py-0.5 rounded bg-[#EFECE6] text-[#1B3B48] hover:bg-[#1B3B48] hover:text-white font-semibold"
                              >
                                ✎ Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100 font-bold"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <h4 className="font-serif font-bold text-[#1B3B48] text-base mb-1">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-[#5C7667] mb-3 line-clamp-2">{doc.chapter}</p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#9C6644] font-semibold">
                        {doc.type} ({doc.size})
                      </span>
                      <div className="flex items-center gap-1.5">
                        {doc.url && doc.url !== "#" && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#1B3B48] text-white text-xs font-bold hover:bg-[#2C4A3E]"
                          >
                            🔗 Mở Link
                          </a>
                        )}
                        {doc.fileDataUrl && (
                          <a
                            href={doc.fileDataUrl}
                            download={doc.fileName || doc.title}
                            className="px-3 py-1.5 rounded-lg bg-[#2C4A3E] text-white text-xs font-bold hover:bg-[#1B3B48]"
                          >
                            ⬇ Tải tệp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MỤC 05B: GIAO BÀI TẬP, NỘP BÀI & CHẤM ĐIỂM (ĐÃ TÁCH RIÊNG)  */}
        {/* ============================================================ */}
        {activeView === "homeworks" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#9C6644] block mb-1">
                  MỤC 05B // HOMEWORK ASSIGNMENT, SUBMISSION & GRADING (TÁCH RIÊNG)
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1B3B48]">
                  Giao Bài Tập, Cổng Nộp Bài Học Sinh & Chấm Điểm Đồng Bộ Hồ Sơ
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveView("documents")}
                  className="px-4 py-2 rounded-xl bg-[#2C4A3E] text-white text-xs font-bold hover:bg-[#1B3B48] shadow-sm"
                >
                  📂 Chuyển sang Mục 05A: Kho Tài Liệu Lớp/Chương →
                </button>
                <button
                  onClick={() => setActiveView("home")}
                  className="text-sm text-[#5C7667] hover:text-[#1B3B48] font-medium px-3 py-2"
                >
                  ← Trang chủ
                </button>
              </div>
            </div>

            {/* PHẦN 1: GIÁO VIÊN GIAO BÀI TẬP MỚI (CÓ HẠN CHÓT KHÓA NỘP BÀI & GỬI EMAIL) */}
            {userRole === "teacher" && (
              <div className="bg-[#EFECE6] rounded-2xl p-6 border border-[#D5CFC4]">
                <h3 className="font-serif font-bold text-lg text-[#1B3B48] mb-3">
                  📝 Giao Bài Tập Mới cho Lớp / Học Sinh (Có Hạn Chót Khóa Tự Động)
                </h3>
                <form onSubmit={handleAssignHomeworkAndEmail} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Tiêu đề Bài tập (VD: Bài tập Ester - Lipid số 01)..."
                      value={hwForm.title}
                      onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white md:col-span-2 font-semibold"
                    />
                    <select
                      value={hwForm.grade}
                      onChange={(e) => setHwForm({ ...hwForm, grade: Number(e.target.value) })}
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold text-[#1B3B48]"
                    >
                      <option value={10}>Khối 10</option>
                      <option value={11}>Khối 11</option>
                      <option value={12}>Khối 12</option>
                    </select>
                    <select
                      value={hwForm.classId}
                      onChange={(e) => setHwForm({ ...hwForm, classId: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold text-[#9C6644]"
                    >
                      <option value="ALL">Giao cho Toàn bộ Khối</option>
                      {classesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          Giao riêng Lớp {c.id} ({c.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        ⏰ Hạn chót nộp bài (Quá giờ tự động khóa):
                      </label>
                      <input
                        type="datetime-local"
                        value={hwForm.deadlineISO}
                        onChange={(e) => setHwForm({ ...hwForm, deadlineISO: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        🎯 Đối tượng nhận bài tập:
                      </label>
                      <select
                        value={hwForm.targetStudentId}
                        onChange={(e) => setHwForm({ ...hwForm, targetStudentId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                      >
                        <option value="ALL">Tất cả học sinh trong Lớp/Khối đã chọn</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            Giao cá nhân: {s.name} ({s.id} - {s.classId})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        🔗 Link Đề bài Google Drive / Azota (nếu có):
                      </label>
                      <input
                        type="url"
                        placeholder="Dán link đề bài..."
                        value={hwForm.attachmentUrl}
                        onChange={(e) => setHwForm({ ...hwForm, attachmentUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                      />
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    required
                    placeholder="Hướng dẫn làm bài, yêu cầu trình bày danh pháp IUPAC..."
                    value={hwForm.description}
                    onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="px-3 py-1.5 rounded-lg bg-white border border-[#D5CFC4] cursor-pointer hover:bg-stone-50 font-semibold text-[#1B3B48]">
                      📎 Đính kèm ảnh/tệp đề bài (&lt;600KB)
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            handleFlexibleFileUpload(f, (res) => {
                              setHwForm((prev) => ({
                                ...prev,
                                attachmentFileName: res.fileName,
                                attachmentDataUrl: res.dataUrl,
                              }));
                            });
                          }
                        }}
                      />
                    </label>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#9C6644] text-white font-bold hover:bg-[#7d5035] shadow-sm"
                    >
                      🚀 Phát Hành Bài Tập & Gửi Email Thông Báo
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PHẦN 2: DANH SÁCH BÀI TẬP ĐÃ GIAO & CỔNG NỘP BÀI CHO HỌC SINH */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-[#1B3B48]">
                  📋 Danh sách Bài Tập Đang Giao ({homeworks.length})
                </h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {homeworks.map((hw) => {
                    const expired = isHomeworkPastDeadline(hw, currentClock);
                    const subCount = homeworkSubmissions.filter(
                      (s) => s.homeworkId === hw.id
                    ).length;
                    return (
                      <div
                        key={hw.id}
                        className={`p-4 rounded-xl border ${
                          expired
                            ? "bg-stone-50 border-stone-200"
                            : "bg-[#F7F6F2] border-[#D5CFC4]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1B3B48] text-[#E9C46A]">
                            Khối {hw.grade} • {hw.classId === "ALL" ? "Mọi lớp" : hw.classId}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              expired
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {formatDeadlineCountdown(hw, currentClock)}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-[#1B3B48] text-sm mb-1">
                          {hw.title}
                        </h4>
                        <p className="text-xs text-stone-600 mb-2">{hw.description}</p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/70 text-[11px]">
                          <span className="font-mono text-stone-500">
                            Hạn nộp: {hw.dueDate} • Đã nộp: <b>{subCount}</b> bài
                          </span>
                          <div className="flex items-center gap-2">
                            {hw.attachmentUrl && (
                              <a
                                href={hw.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#1B3B48] font-bold hover:underline"
                              >
                                🔗 Mở đề bài
                              </a>
                            )}
                            {hw.attachmentDataUrl && (
                              <a
                                href={hw.attachmentDataUrl}
                                download={hw.attachmentFileName || "De_bai"}
                                className="text-[#2C4A3E] font-bold hover:underline"
                              >
                                ⬇ Tải tệp đề
                              </a>
                            )}
                            {!expired && (
                              <button
                                onClick={() =>
                                  setHwSubmitForm((prev) => ({ ...prev, homeworkId: hw.id }))
                                }
                                className="px-2.5 py-1 rounded bg-[#9C6644] text-white font-bold hover:bg-[#7d5035]"
                              >
                                📤 Chọn nộp bài này
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CỔNG HỌC SINH NỘP BÀI TẬP */}
              <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm">
                <h3 className="font-serif font-bold text-lg text-[#1B3B48] mb-3">
                  📤 Cổng Học Sinh Nộp Bài Tập Về Nhà
                </h3>
                <form onSubmit={handleSubmitHomeworkWork} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">
                      1. Chọn Bài tập cần nộp:
                    </label>
                    <select
                      required
                      value={hwSubmitForm.homeworkId}
                      onChange={(e) =>
                        setHwSubmitForm({ ...hwSubmitForm, homeworkId: e.target.value })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-[#D5CFC4] bg-[#F7F6F2] font-bold text-[#1B3B48]"
                    >
                      <option value="">-- Chọn bài tập --</option>
                      {homeworks.map((h) => {
                        const expired = isHomeworkPastDeadline(h, currentClock);
                        return (
                          <option key={h.id} value={h.id} disabled={expired}>
                            [{h.classId || `Khối ${h.grade}`}] {h.title}{" "}
                            {expired ? "(ĐÃ KHÓA HẠN NỘP)" : `(Hạn: ${h.dueDate})`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 mb-1">
                      2. Trình bày lời giải / Đáp án trực tiếp hoặc Link bài làm:
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Nhập lời giải, đáp án hoặc dán link Google Drive chứa ảnh bài giải của em..."
                      value={hwSubmitForm.answerText}
                      onChange={(e) =>
                        setHwSubmitForm({ ...hwSubmitForm, answerText: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#D5CFC4] bg-[#F7F6F2]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <label className="px-3.5 py-2 rounded-xl bg-[#EFECE6] border border-[#D5CFC4] cursor-pointer hover:bg-[#E5E0D8] font-bold text-[#1B3B48]">
                      📷 Đính kèm Ảnh chụp bài giải / File (&lt;600KB)
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            handleFlexibleFileUpload(f, (res) => {
                              setHwSubmitForm((prev) => ({
                                ...prev,
                                fileName: res.fileName,
                                fileDataUrl: res.dataUrl,
                              }));
                            });
                          }
                        }}
                      />
                    </label>
                    {hwSubmitForm.fileName && (
                      <span className="text-emerald-700 font-semibold">
                        ✓ Đã đính kèm: {hwSubmitForm.fileName}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E] shadow-sm mt-2"
                  >
                    ✓ Gửi Bài Làm Cho Thầy Tuấn Anh
                  </button>
                </form>
              </div>
            </div>

            {/* PHẦN 3: BẢNG THEO DÕI & CHẤM ĐIỂM BÀI TẬP (ĐỒNG BỘ SANG MỤC 04) */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1B3B48]">
                    ✅ Bảng Theo Dõi Nộp Bài & Chấm Điểm Tự Động Đồng Bộ Hồ Sơ (Mục 04)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Khi Giáo viên nhập điểm và bấm Lưu chấm điểm, điểm số sẽ tự động ghi vào Hồ sơ Học sinh ở Mục 04.
                  </p>
                </div>
                <select
                  value={selectedHwForTracking}
                  onChange={(e) => setSelectedHwForTracking(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D5CFC4] bg-[#F7F6F2] text-xs font-bold text-[#1B3B48]"
                >
                  <option value="ALL">Xem tất cả bài nộp ({homeworkSubmissions.length})</option>
                  {homeworks.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1B3B48] text-white font-mono uppercase">
                      <th className="p-3">Học sinh</th>
                      <th className="p-3">Bài tập</th>
                      <th className="p-3">Thời gian nộp</th>
                      <th className="p-3">Bài làm / Tệp đính kèm</th>
                      <th className="p-3">Điểm số</th>
                      <th className="p-3">Nhận xét & Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {homeworkSubmissions
                      .filter(
                        (s) =>
                          selectedHwForTracking === "ALL" ||
                          s.homeworkId === selectedHwForTracking
                      )
                      .map((sub) => (
                        <tr key={sub.id} className="hover:bg-stone-50">
                          <td className="p-3 font-bold text-[#1B3B48]">
                            {sub.studentName}{" "}
                            <span className="font-mono text-[10px] text-stone-400 block">
                              {sub.studentId} • Lớp {sub.classId}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-[#2C4A3E]">{sub.homeworkTitle}</td>
                          <td className="p-3 font-mono text-stone-500">{sub.submittedAt}</td>
                          <td className="p-3">
                            <div className="max-w-xs truncate text-stone-700 mb-1">
                              {sub.answerText || "(Chỉ đính kèm tệp)"}
                            </div>
                            {sub.fileDataUrl && (
                              <a
                                href={sub.fileDataUrl}
                                download={sub.fileName || "Bai_lam_HS"}
                                className="inline-block px-2 py-0.5 rounded bg-[#EFECE6] text-[#1B3B48] font-bold text-[10px]"
                              >
                                📎 Tải tệp: {sub.fileName}
                              </a>
                            )}
                          </td>
                          <td className="p-3">
                            {sub.status === "graded" ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white font-bold">
                                {sub.score} đ
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                                Chờ chấm
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {userRole === "teacher" ? (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="10"
                                  placeholder="Điểm"
                                  value={
                                    gradingBuffer[sub.id]?.score ??
                                    (sub.score !== undefined ? String(sub.score) : "")
                                  }
                                  onChange={(e) =>
                                    setGradingBuffer({
                                      ...gradingBuffer,
                                      [sub.id]: {
                                        score: e.target.value,
                                        feedback:
                                          gradingBuffer[sub.id]?.feedback ??
                                          (sub.teacherFeedback || ""),
                                      },
                                    })
                                  }
                                  className="w-16 px-2 py-1 rounded border border-[#D5CFC4] bg-white font-bold"
                                />
                                <input
                                  type="text"
                                  placeholder="Nhận xét..."
                                  value={
                                    gradingBuffer[sub.id]?.feedback ?? (sub.teacherFeedback || "")
                                  }
                                  onChange={(e) =>
                                    setGradingBuffer({
                                      ...gradingBuffer,
                                      [sub.id]: {
                                        score:
                                          gradingBuffer[sub.id]?.score ??
                                          (sub.score !== undefined ? String(sub.score) : ""),
                                        feedback: e.target.value,
                                      },
                                    })
                                  }
                                  className="w-32 px-2 py-1 rounded border border-[#D5CFC4] bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleGradeHomeworkAndSyncProfile(sub)}
                                  className="px-2.5 py-1 rounded bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E]"
                                >
                                  Lưu điểm
                                </button>
                              </div>
                            ) : (
                              <span className="text-stone-600 italic">
                                {sub.teacherFeedback || "Chưa có nhận xét"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ============================================================ */}
        {/* MỤC 06: NGÂN HÀNG ĐỀ KIỂM TRA & BÀI THI THỬ                  */}
        {/* ============================================================ */}
        {activeView === "exams" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#9C6644] block mb-1">
                  MỤC 06 // EXAM BANK & MOCK TESTS
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1B3B48]">
                  Ngân hàng Đề Kiểm tra, Thi thử & Cổng Nộp bài Chấm điểm
                </h2>
              </div>
              <button
                onClick={() => setActiveView("home")}
                className="text-sm text-[#5C7667] hover:text-[#1B3B48] font-medium"
              >
                ← Quay lại Trang chủ
              </button>
            </div>

            {userRole === "teacher" && (
              <div className="bg-[#EFECE6] rounded-2xl p-6 border border-[#D5CFC4]">
                <h3 className="font-serif font-bold text-lg text-[#1B3B48] mb-3">
                  ➕ Tạo Đề Kiểm Tra / Đề Thi Thử Mới
                </h3>
                <form onSubmit={handleAddExamPaper} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Tên đề thi (VD: Đề thi thử TN THPT Lần 2)..."
                    value={examForm.title}
                    onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white md:col-span-2"
                  />
                  <select
                    value={examForm.grade}
                    onChange={(e) => setExamForm({ ...examForm, grade: Number(e.target.value) })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                  <select
                    value={examForm.classId}
                    onChange={(e) => setExamForm({ ...examForm, classId: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold text-[#9C6644]"
                  >
                    <option value="ALL">Mọi lớp trong Khối</option>
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.id} - {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={examForm.category}
                    onChange={(e) => setExamForm({ ...examForm, category: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  >
                    {EXAM_CATEGORIES.filter((c) => c !== "Tất cả").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Thời gian (phút)"
                    value={examForm.duration}
                    onChange={(e) => setExamForm({ ...examForm, duration: Number(e.target.value) })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  />
                  <input
                    type="url"
                    placeholder="Link App Thi Online / Azota / Google Form..."
                    value={examForm.examAppLink}
                    onChange={(e) => setExamForm({ ...examForm, examAppLink: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E]"
                  >
                    + Đăng Đề Thi
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examPapers.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-white rounded-2xl p-5 border border-[#E5E0D8] shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#1B3B48] text-[#E9C46A]">
                        Khối {ex.grade} • {ex.category}
                      </span>
                      <span className="text-xs font-mono text-stone-500">
                        ⏱ {ex.duration} phút • {ex.questionCount} câu
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-[#1B3B48] text-base mb-1">
                      {ex.title}
                    </h4>
                    <p className="text-xs text-stone-500 mb-3">
                      Hạn nộp: {ex.deadline} • Mã đề: {ex.id}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E5E0D8]">
                    <div className="flex gap-2">
                      {ex.examAppLink && (
                        <a
                          href={ex.examAppLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#2C4A3E] text-white text-xs font-bold hover:bg-[#1B3B48]"
                        >
                          🚀 Mở App Làm Bài
                        </a>
                      )}
                      {ex.fileDataUrl && (
                        <a
                          href={ex.fileDataUrl}
                          download={ex.fileName || ex.title}
                          className="px-3 py-1.5 rounded-lg bg-[#EFECE6] text-[#1B3B48] text-xs font-bold"
                        >
                          ⬇ Tải Đề PDF
                        </a>
                      )}
                    </div>
                    {userRole === "teacher" && (
                      <button
                        onClick={() => handleDeleteExamPaper(ex.id)}
                        className="text-xs text-red-600 hover:underline font-semibold"
                      >
                        Xóa đề
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MỤC 07: BẢNG VÀNG THÀNH TÍCH HỌC SINH                        */}
        {/* ============================================================ */}
        {activeView === "honor" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#9C6644] block mb-1">
                  MỤC 07 // HALL OF FAME & HONOR ROLL
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1B3B48]">
                  Bảng Vàng Vinh Danh Học Sinh Xuất Sắc
                </h2>
              </div>
              <button
                onClick={() => setActiveView("home")}
                className="text-sm text-[#5C7667] hover:text-[#1B3B48] font-medium"
              >
                ← Quay lại Trang chủ
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {combinedHonorBoard.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-gradient-to-br from-[#1B3B48] to-[#2C4A3E] text-white rounded-2xl p-5 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{ach.badge}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-[#E9C46A]">
                        {ach.classId || `Khối ${ach.grade}`}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-lg text-[#E9C46A]">
                      {ach.studentName}
                    </h4>
                    <p className="text-xs font-semibold text-white mt-1">{ach.title}</p>
                    <p className="text-[11px] text-stone-300 mt-2">{ach.note}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-300 font-bold">
                      Điểm: {ach.score}
                    </span>
                    {userRole === "teacher" && !String(ach.id).startsWith("AUTO-") && (
                      <button
                        onClick={() => handleDeleteAchievement(ach.id)}
                        className="text-[10px] text-red-300 hover:text-red-100"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MỤC 08: GÓC HỌC TẬP & TRA CỨU DANH PHÁP IUPAC                */}
        {/* ============================================================ */}
        {activeView === "chem_tools" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#9C6644] block mb-1">
                  MỤC 08 // IUPAC REFERENCE TABLES & STUDY TOOLS
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1B3B48]">
                  Góc Học Tập, Bảng Tra Cứu Danh Pháp Quốc Tế IUPAC & Flashcards
                </h2>
              </div>
              <button
                onClick={() => setActiveView("home")}
                className="text-sm text-[#5C7667] hover:text-[#1B3B48] font-medium"
              >
                ← Quay lại Trang chủ
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["fatty_acids", "🧪 Acid béo & Ester"],
                ["amino_acids", "🧬 Amino acid & Peptide"],
                ["indicators", "🌈 Chất chỉ thị pH"],
                ["lab_equip", "🔬 Dụng cụ thí nghiệm"],
                ["chem_notes", "📌 Ghi chú Hóa học"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedRefTab(key as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedRefTab === key
                      ? "bg-[#1B3B48] text-white"
                      : "bg-[#EFECE6] text-[#1B3B48] hover:bg-[#E5E0D8]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm overflow-x-auto">
              {selectedRefTab === "fatty_acids" && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1B3B48] text-white font-mono uppercase">
                      <th className="p-3">Công thức</th>
                      <th className="p-3">Công thức khung</th>
                      <th className="p-3">Tên thông thường</th>
                      <th className="p-3">Danh pháp IUPAC</th>
                      <th className="p-3">M (g/mol)</th>
                      <th className="p-3">Trạng thái & Triglyceride</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {FATTY_ACIDS_TABLE.map((r, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold text-[#1B3B48]">{r.formula}</td>
                        <td className="p-3 font-mono text-stone-600">{r.condensed}</td>
                        <td className="p-3 font-semibold">{r.commonName}</td>
                        <td className="p-3 font-bold text-[#2C4A3E]">{r.iupacName}</td>
                        <td className="p-3 font-mono">{r.molarMass}</td>
                        <td className="p-3 text-stone-600">
                          {r.type} — {r.triglyceride} (M = {r.triglycerideM})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedRefTab === "amino_acids" && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1B3B48] text-white font-mono uppercase">
                      <th className="p-3">Ký hiệu</th>
                      <th className="p-3">Tên thường (IUPAC)</th>
                      <th className="p-3">Tên thay thế IUPAC</th>
                      <th className="p-3">Công thức cấu tạo</th>
                      <th className="p-3">M (g/mol)</th>
                      <th className="p-3">Môi trường & Quỳ tím</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {AMINO_ACIDS_TABLE.map((r, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold text-[#9C6644]">{r.symbol}</td>
                        <td className="p-3 font-bold text-[#1B3B48]">{r.commonName}</td>
                        <td className="p-3 text-[#2C4A3E] font-medium">{r.iupacName}</td>
                        <td className="p-3 font-mono">{r.formula}</td>
                        <td className="p-3 font-mono font-bold">{r.molarMass}</td>
                        <td className="p-3 text-stone-600">{r.litmus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedRefTab === "indicators" && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1B3B48] text-white font-mono uppercase">
                      <th className="p-3">Chất chỉ thị</th>
                      <th className="p-3">Môi trường Acid</th>
                      <th className="p-3">Trung tính</th>
                      <th className="p-3">Môi trường Base</th>
                      <th className="p-3">Ghi chú khoảng đổi màu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {PH_INDICATORS_TABLE.map((r, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-[#1B3B48]">{r.indicator}</td>
                        <td className="p-3 text-red-600 font-semibold">{r.acidEnv}</td>
                        <td className="p-3 text-stone-600">{r.neutralEnv}</td>
                        <td className="p-3 text-blue-600 font-semibold">{r.baseEnv}</td>
                        <td className="p-3 text-stone-500">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedRefTab === "lab_equip" && (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1B3B48] text-white font-mono uppercase">
                      <th className="p-3">Tên dụng cụ</th>
                      <th className="p-3">Phân loại</th>
                      <th className="p-3">Công dụng chính</th>
                      <th className="p-3">Lưu ý an toàn & Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {LAB_EQUIPMENT_TABLE.map((r, i) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-[#1B3B48]">{r.name}</td>
                        <td className="p-3 text-[#9C6644] font-semibold">{r.category}</td>
                        <td className="p-3 text-stone-700">{r.usage}</td>
                        <td className="p-3 text-stone-500">{r.caution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedRefTab === "chem_notes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CHEM_REFERENCE_NOTES.map((n, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E5E0D8]">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1B3B48] text-[#E9C46A]">
                        {n.category}
                      </span>
                      <h4 className="font-serif font-bold text-[#1B3B48] text-sm mt-2 mb-1">
                        {n.title}
                      </h4>
                      <p className="text-xs text-stone-700 leading-relaxed mb-2">{n.content}</p>
                      <p className="text-[11px] font-mono text-[#2C4A3E] bg-white p-2 rounded border border-stone-200">
                        💡 {n.example}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MỤC 09: QUẢN LÝ LỚP HỌC & DANH SÁCH HỌC SINH (CÓ SỬA LỚP/HS) */}
        {/* ============================================================ */}
        {activeView === "students_admin" && userRole === "teacher" && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#9C6644] block mb-1">
                  MỤC 09 // CLASSROOM & STUDENT ROSTER ADMINISTRATION
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1B3B48]">
                  Quản lý Các Lớp Học, Sửa Lớp & Chỉnh sửa Danh sách Học Sinh
                </h2>
              </div>
              <button
                onClick={() => setActiveView("home")}
                className="text-sm text-[#5C7667] hover:text-[#1B3B48] font-medium"
              >
                ← Quay lại Trang chủ
              </button>
            </div>

            {/* PHẦN 1: TẠO LỚP MỚI & DANH SÁCH CÁC LỚP (CÓ NÚT SỬA LỚP SAU KHI TẠO) */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm space-y-5">
              <h3 className="font-serif font-bold text-lg text-[#1B3B48]">
                🏫 1. Quản lý Danh sách Lớp Học ({classesList.length} lớp) — Cho phép Sửa Lớp sau khi tạo
              </h3>

              <form onSubmit={handleAddClass} className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-[#EFECE6] p-4 rounded-xl text-xs">
                <input
                  type="text"
                  required
                  placeholder="Mã lớp (VD: 12H1)"
                  value={newClassForm.id}
                  onChange={(e) => setNewClassForm({ ...newClassForm, id: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-mono font-bold uppercase"
                />
                <input
                  type="text"
                  required
                  placeholder="Tên lớp (VD: Lớp 12H1 - Mục tiêu 9+)"
                  value={newClassForm.name}
                  onChange={(e) => setNewClassForm({ ...newClassForm, name: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white md:col-span-2"
                />
                <select
                  value={newClassForm.grade}
                  onChange={(e) =>
                    setNewClassForm({
                      ...newClassForm,
                      grade: Number(e.target.value) as 10 | 11 | 12,
                    })
                  }
                  className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold"
                >
                  <option value={10}>Khối 10</option>
                  <option value={11}>Khối 11</option>
                  <option value={12}>Khối 12</option>
                </select>
                <input
                  type="text"
                  placeholder="Lịch học tóm tắt (VD: T2, T4, T6 - 19h45)"
                  value={newClassForm.scheduleSummary}
                  onChange={(e) =>
                    setNewClassForm({ ...newClassForm, scheduleSummary: e.target.value })
                  }
                  className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E]"
                >
                  + Tạo Lớp Mới
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classesList.map((cls) => {
                  const classStuCount = students.filter((s) => s.classId === cls.id).length;
                  return (
                    <div
                      key={cls.id}
                      className="p-4 rounded-xl border border-[#D5CFC4] bg-[#F7F6F2] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#1B3B48] text-[#E9C46A]">
                            {cls.id} • Khối {cls.grade}
                          </span>
                          <span className="text-xs font-mono text-stone-500">
                            NH: {cls.academicYear || selectedAcademicYear}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-[#1B3B48] text-base">
                          {cls.name}
                        </h4>
                        <p className="text-xs text-stone-600 mt-1">
                          ⏰ {cls.scheduleSummary} • Sĩ số: <b>{classStuCount}</b> HS
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => openQuickAttendance(cls)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-bold hover:bg-emerald-800"
                          >
                            ✓ Điểm danh
                          </button>
                          <button
                            onClick={() =>
                              setEditingClassModal({
                                originalId: cls.id,
                                id: cls.id,
                                name: cls.name,
                                grade: cls.grade,
                                academicYear: cls.academicYear || selectedAcademicYear,
                                scheduleSummary: cls.scheduleSummary,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#E9C46A] text-[#1B3B48] text-[11px] font-bold hover:bg-[#f0d182]"
                          >
                            ✎ Sửa lớp
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[11px] font-semibold hover:bg-red-100"
                        >
                          Xóa lớp
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PHẦN 2: THÊM HỌC SINH & DANH SÁCH HỌC SINH (CÓ NÚT SỬA HỌC SINH SAU KHI TẠO) */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-serif font-bold text-lg text-[#1B3B48]">
                  👨‍🎓 2. Danh sách Học Sinh ({students.length} HS) — Cho phép Sửa Thông tin HS sau khi tạo
                </h3>
                <button
                  onClick={() => setShowBulkImportBox(!showBulkImportBox)}
                  className="px-3.5 py-2 rounded-xl bg-[#2C4A3E] text-white text-xs font-bold hover:bg-[#1B3B48]"
                >
                  📋 Nhập nhanh danh sách từ Excel / Google Sheets
                </button>
              </div>

              {showBulkImportBox && (
                <form onSubmit={handleBulkExcelImport} className="bg-[#EFECE6] p-4 rounded-xl border border-[#D5CFC4] space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[#1B3B48]">
                      Dán dữ liệu từ Excel (Mỗi dòng: Họ tên [Tab/Phẩy] Email [Tab/Phẩy] Mật khẩu [Tab/Phẩy] Mục tiêu):
                    </span>
                    <select
                      value={bulkImportClassId}
                      onChange={(e) => setBulkImportClassId(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-[#D5CFC4] bg-white font-bold"
                    >
                      {classesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          Nhập vào Lớp {c.id} ({c.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    rows={4}
                    placeholder={"Nguyễn Văn A\\tnguyenvana@gmail.com\\t123456\\tĐH Y Dược TP.HCM\\nTrần Thị B\\ttranthib@gmail.com\\t123456\\tĐH Bách Khoa"}
                    value={bulkImportText}
                    onChange={(e) => setBulkImportText(e.target.value)}
                    className="w-full p-3 rounded-lg border border-[#D5CFC4] bg-white font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#1B3B48] text-white font-bold"
                  >
                    ✓ Thực hiện Nhập Hàng Loạt
                  </button>
                </form>
              )}

              {/* Form thêm 1 học sinh */}
              <form onSubmit={handleAddStudentAccount} className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-[#F7F6F2] p-4 rounded-xl border border-[#E5E0D8] text-xs">
                <input
                  type="text"
                  required
                  placeholder="Họ và tên Học sinh..."
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-semibold"
                />
                <select
                  value={newStudentForm.classId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const found = classesList.find((c) => c.id === cid);
                    setNewStudentForm({
                      ...newStudentForm,
                      classId: cid,
                      grade: found ? found.grade : newStudentForm.grade,
                    });
                  }}
                  className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold text-[#1B3B48]"
                >
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.id} (Khối {c.grade})
                    </option>
                  ))}
                </select>
                <input
                  type="email"
                  required
                  placeholder="Email đăng nhập..."
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Mật khẩu..."
                  value={newStudentForm.password}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, password: e.target.value })
                  }
                  className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Trường ĐH mục tiêu..."
                  value={newStudentForm.universityGoal}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, universityGoal: e.target.value })
                  }
                  className="px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E]"
                >
                  + Cấp Tài Khoản HS
                </button>
              </form>

              {/* Bảng danh sách học sinh */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#1B3B48] text-white font-mono uppercase">
                      <th className="p-3">Mã HS</th>
                      <th className="p-3">Họ và tên</th>
                      <th className="p-3">Lớp / Khối</th>
                      <th className="p-3">Email & Mật khẩu</th>
                      <th className="p-3">ĐTB & Chuyên cần</th>
                      <th className="p-3">Mục tiêu</th>
                      <th className="p-3 text-right">Thao tác (Sửa / Xóa)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold text-[#9C6644]">{st.id}</td>
                        <td className="p-3 font-bold text-[#1B3B48]">{st.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-[#EFECE6] text-[#1B3B48] font-mono font-bold">
                            {st.classId} (K{st.grade})
                          </span>
                        </td>
                        <td className="p-3 font-mono text-stone-600">
                          <div>{st.email}</div>
                          <div className="text-[10px] text-stone-400">MK: {st.password}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-[#1B3B48]">{st.score} đ</span> •{" "}
                          <span className="text-emerald-700 font-semibold">
                            {st.attendanceRate}%
                          </span>
                        </td>
                        <td className="p-3 text-stone-600">
                          {st.universityGoal} ({st.targetScore}+)
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingStudentModal({ ...st, originalId: st.id })}
                              className="px-2.5 py-1 rounded bg-[#E9C46A] text-[#1B3B48] font-bold hover:bg-[#f0d182]"
                            >
                              ✎ Sửa HS
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStudentId(st.id);
                                setActiveView("progress");
                              }}
                              className="px-2.5 py-1 rounded bg-[#EFECE6] text-[#1B3B48] font-semibold hover:bg-[#E5E0D8]"
                            >
                              Hồ sơ
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(st.id)}
                              className="px-2 py-1 rounded bg-red-50 text-red-600 font-semibold hover:bg-red-100"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MỤC 10: GÓC HÓA HỌC MỖI NGÀY (CHEM FEED & ĐỐ VUI)            */}
        {/* ============================================================ */}
        {activeView === "chem_feed" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#9C6644] block mb-1">
                  MỤC 10 // DAILY CHEMISTRY STORIES & INTERACTIVE QUIZ
                </span>
                <h2 className="text-2xl font-serif font-bold text-[#1B3B48]">
                  Góc Hóa Học Mỗi Ngày: Câu Chuyện Thực Tiễn, Đố Vui & Hỏi Đáp Tích Điểm
                </h2>
              </div>
              <button
                onClick={() => setActiveView("home")}
                className="text-sm text-[#5C7667] hover:text-[#1B3B48] font-medium"
              >
                ← Quay lại Trang chủ
              </button>
            </div>

            <div className="space-y-4">
              {chemFeedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-6 border border-[#E5E0D8] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#1B3B48] text-[#E9C46A]">
                      {post.authorName} • Khối {post.grade}
                    </span>
                    <span className="text-xs font-mono text-stone-400">{post.createdAt}</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#1B3B48]">{post.title}</h3>
                  <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: SỬA THÔNG TIN LỚP HỌC SAU KHI TẠO (EDIT CLASS MODAL)  */}
      {/* ============================================================== */}
      {editingClassModal && userRole === "teacher" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F7F6F2] border border-[#D5CFC4] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3 mb-4">
              <h3 className="font-serif font-bold text-lg text-[#1B3B48]">
                ✎ Chỉnh sửa Thông tin Lớp Học ({editingClassModal.originalId})
              </h3>
              <button
                onClick={() => setEditingClassModal(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditedClass} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">
                    Mã Lớp (Đổi mã sẽ tự động cập nhật sang HS & Lịch):
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClassModal.id}
                    onChange={(e) =>
                      setEditingClassModal({ ...editingClassModal, id: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Khối Lớp:</label>
                  <select
                    value={editingClassModal.grade}
                    onChange={(e) =>
                      setEditingClassModal({
                        ...editingClassModal,
                        grade: Number(e.target.value) as 10 | 11 | 12,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1">Tên hiển thị của Lớp:</label>
                <input
                  type="text"
                  required
                  value={editingClassModal.name}
                  onChange={(e) =>
                    setEditingClassModal({ ...editingClassModal, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Năm học:</label>
                  <select
                    value={editingClassModal.academicYear}
                    onChange={(e) =>
                      setEditingClassModal({
                        ...editingClassModal,
                        academicYear: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  >
                    {academicYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Ca học cố định:</label>
                  <input
                    type="text"
                    value={editingClassModal.scheduleSummary}
                    onChange={(e) =>
                      setEditingClassModal({
                        ...editingClassModal,
                        scheduleSummary: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E0D8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClassModal(null)}
                  className="px-4 py-2 rounded-lg border border-[#D5CFC4] text-stone-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E]"
                >
                  ✓ Lưu Thay Đổi Lớp Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: SỬA THÔNG TIN HỌC SINH SAU KHI TẠO (EDIT STUDENT)     */}
      {/* ============================================================== */}
      {editingStudentModal && userRole === "teacher" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F7F6F2] border border-[#D5CFC4] rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3 mb-4">
              <h3 className="font-serif font-bold text-lg text-[#1B3B48]">
                ✎ Chỉnh sửa Hồ sơ & Thông tin Học Sinh ({editingStudentModal.name})
              </h3>
              <button
                onClick={() => setEditingStudentModal(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditedStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Mã Học Sinh:</label>
                  <input
                    type="text"
                    required
                    value={editingStudentModal.id}
                    onChange={(e) =>
                      setEditingStudentModal({ ...editingStudentModal, id: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-mono font-bold uppercase"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-600 mb-1">Họ và tên Học sinh:</label>
                  <input
                    type="text"
                    required
                    value={editingStudentModal.name}
                    onChange={(e) =>
                      setEditingStudentModal({ ...editingStudentModal, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Lớp học:</label>
                  <select
                    value={editingStudentModal.classId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const found = classesList.find((c) => c.id === cid);
                      setEditingStudentModal({
                        ...editingStudentModal,
                        classId: cid,
                        grade: found ? found.grade : editingStudentModal.grade,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold text-[#1B3B48]"
                  >
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Khối:</label>
                  <select
                    value={editingStudentModal.grade}
                    onChange={(e) =>
                      setEditingStudentModal({
                        ...editingStudentModal,
                        grade: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Năm học:</label>
                  <select
                    value={editingStudentModal.academicYear || selectedAcademicYear}
                    onChange={(e) =>
                      setEditingStudentModal({
                        ...editingStudentModal,
                        academicYear: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  >
                    {academicYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Email đăng nhập:</label>
                  <input
                    type="email"
                    required
                    value={editingStudentModal.email}
                    onChange={(e) =>
                      setEditingStudentModal({ ...editingStudentModal, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Mật khẩu:</label>
                  <input
                    type="text"
                    required
                    value={editingStudentModal.password}
                    onChange={(e) =>
                      setEditingStudentModal({ ...editingStudentModal, password: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Điểm TB:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingStudentModal.score}
                    onChange={(e) =>
                      setEditingStudentModal({
                        ...editingStudentModal,
                        score: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Điểm mục tiêu:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingStudentModal.targetScore}
                    onChange={(e) =>
                      setEditingStudentModal({
                        ...editingStudentModal,
                        targetScore: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Chuyên cần (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingStudentModal.attendanceRate}
                    onChange={(e) =>
                      setEditingStudentModal({
                        ...editingStudentModal,
                        attendanceRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Trường ĐH mục tiêu:</label>
                  <input
                    type="text"
                    value={editingStudentModal.universityGoal}
                    onChange={(e) =>
                      setEditingStudentModal({
                        ...editingStudentModal,
                        universityGoal: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1">Ghi chú chuyên cần:</label>
                <input
                  type="text"
                  value={editingStudentModal.attendanceNote}
                  onChange={(e) =>
                    setEditingStudentModal({
                      ...editingStudentModal,
                      attendanceNote: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1">Thái độ học tập:</label>
                <input
                  type="text"
                  value={editingStudentModal.attitude}
                  onChange={(e) =>
                    setEditingStudentModal({ ...editingStudentModal, attitude: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-600 mb-1">
                  Nhận xét học lực của Giáo viên:
                </label>
                <textarea
                  rows={2}
                  value={editingStudentModal.teacherComment}
                  onChange={(e) =>
                    setEditingStudentModal({
                      ...editingStudentModal,
                      teacherComment: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E0D8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudentModal(null)}
                  className="px-4 py-2 rounded-lg border border-[#D5CFC4] text-stone-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E]"
                >
                  ✓ Lưu Hồ Sơ Học Sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CHỈNH SỬA TÀI LIỆU KHO HỌC LIỆU (EDIT DOCUMENT)       */}
      {/* ============================================================== */}
      {editingDocModal && userRole === "teacher" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F7F6F2] border border-[#D5CFC4] rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3 mb-4">
              <h3 className="font-serif font-bold text-lg text-[#1B3B48]">
                ✎ Chỉnh sửa Tài liệu Học tập
              </h3>
              <button
                onClick={() => setEditingDocModal(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditedDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-600 mb-1">Tên tài liệu:</label>
                <input
                  type="text"
                  required
                  value={editingDocModal.title}
                  onChange={(e) =>
                    setEditingDocModal({ ...editingDocModal, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Khối:</label>
                  <select
                    value={editingDocModal.grade}
                    onChange={(e) =>
                      setEditingDocModal({ ...editingDocModal, grade: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Lớp:</label>
                  <select
                    value={editingDocModal.classId || "ALL"}
                    onChange={(e) =>
                      setEditingDocModal({ ...editingDocModal, classId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                  >
                    <option value="ALL">Mọi lớp</option>
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-stone-600 mb-1">Link tài liệu:</label>
                <input
                  type="url"
                  value={editingDocModal.url}
                  onChange={(e) =>
                    setEditingDocModal({ ...editingDocModal, url: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white"
                />
              </div>
              <div className="pt-3 border-t border-[#E5E0D8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDocModal(null)}
                  className="px-4 py-2 rounded-lg border border-[#D5CFC4] text-stone-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1B3B48] text-white font-bold"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ĐIỂM DANH LỚP HỌC & GỬI TÀI LIỆU BUỔI HỌC HÔM NAY     */}
      {/* ============================================================== */}
      {attendanceModalClass && userRole === "teacher" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F7F6F2] border border-[#D5CFC4] rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold block">
                  ĐIỂM DANH CA HỌC & TÀI LIỆU BUỔI HỌC
                </span>
                <h3 className="font-serif font-bold text-lg text-[#1B3B48]">
                  ✓ Điểm danh Lớp {attendanceModalClass.id} — {attendanceModalClass.name}
                </h3>
              </div>
              <button
                onClick={() => setAttendanceModalClass(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttendanceSession} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#EFECE6] p-4 rounded-xl border border-[#D5CFC4]">
                <div>
                  <label className="block font-bold text-stone-600 mb-1">Ngày điểm danh:</label>
                  <input
                    type="date"
                    required
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-600 mb-1">
                    Nội dung bài học / Ca học đang diễn ra:
                  </label>
                  <input
                    type="text"
                    required
                    value={attendanceLessonTitle}
                    onChange={(e) => setAttendanceLessonTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-stone-200 border border-[#D5CFC4] rounded-xl bg-white">
                {attendanceDraftRecords.length === 0 ? (
                  <p className="p-4 text-center text-stone-500 italic">
                    Lớp này hiện chưa có học sinh nào.
                  </p>
                ) : (
                  attendanceDraftRecords.map((rec, idx) => (
                    <div
                      key={rec.studentId}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50"
                    >
                      <div>
                        <span className="font-mono text-stone-400 mr-2">{idx + 1}.</span>
                        <span className="font-bold text-[#1B3B48]">{rec.studentName}</span>
                        <span className="font-mono text-[10px] text-stone-400 ml-1">
                          ({rec.studentId})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(
                          [
                            ["present", "✓ Có mặt", "bg-emerald-600 text-white"],
                            ["late", "⏰ Đi muộn", "bg-amber-500 text-white"],
                            ["excused", "📩 Có phép", "bg-sky-600 text-white"],
                            ["unexcused", "✕ Không phép", "bg-red-600 text-white"],
                          ] as const
                        ).map(([stKey, stLabel, activeCls]) => (
                          <button
                            key={stKey}
                            type="button"
                            onClick={() => {
                              const next = [...attendanceDraftRecords];
                              next[idx] = { ...next[idx], status: stKey };
                              setAttendanceDraftRecords(next);
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                              rec.status === stKey
                                ? activeCls
                                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            }`}
                          >
                            {stLabel}
                          </button>
                        ))}
                        <input
                          type="text"
                          placeholder="Ghi chú..."
                          value={rec.note}
                          onChange={(e) => {
                            const next = [...attendanceDraftRecords];
                            next[idx] = { ...next[idx], note: e.target.value };
                            setAttendanceDraftRecords(next);
                          }}
                          className="px-2 py-1 rounded border border-stone-200 text-[11px] w-28"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-[#E5E0D8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAttendanceModalClass(null)}
                  className="px-4 py-2 rounded-lg border border-[#D5CFC4] text-stone-600 font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-sm"
                >
                  ✓ Lưu Điểm Danh & Cập Nhật Chuyên Cần
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: QUẢN LÝ CLOUD FIREBASE, DỌN BỘ NHỚ & SAO LƯU JSON     */}
      {/* ============================================================== */}
      {showCloudModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F7F6F2] border border-[#D5CFC4] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9C6644] font-bold block">
                  CLOUD SYNC & ANTI-DATA-LOSS PROTECTION
                </span>
                <h3 className="font-serif font-bold text-lg text-[#1B3B48]">
                  ☁ Quản lý Đồng bộ Firebase, Giải phóng Bộ nhớ & Sao lưu
                </h3>
              </div>
              <button
                onClick={() => setShowCloudModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-[#E5E0D8]">
                <span className="font-bold text-[#1B3B48] block mb-1">
                  🔗 Đường dẫn Firebase Realtime Database:
                </span>
                <input
                  type="url"
                  value={firebaseUrl}
                  onChange={(e) => {
                    setFirebaseUrl(e.target.value);
                    localStorage.setItem("fb_url_nhatha_v8", e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5CFC4] bg-[#F7F6F2] font-mono text-[11px]"
                />
                <div className="flex items-center justify-between mt-2 text-[11px] text-stone-500">
                  <span>
                    Trạng thái:{" "}
                    <b className="text-emerald-700">
                      {cloudSyncStatus === "synced"
                        ? "Đã đồng bộ an toàn"
                        : cloudSyncStatus === "syncing"
                        ? "Đang đồng bộ..."
                        : cloudSyncStatus === "error"
                        ? "Đang lưu cục bộ (Chờ mạng/Quota)"
                        : "Sẵn sàng"}
                    </b>
                  </span>
                  <span>Cập nhật lần cuối: {lastCloudSyncTime || "Vừa xong"}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">
                    📊 Dung lượng dữ liệu hiện tại:
                  </span>
                  <span className="font-mono font-bold text-amber-900 px-2 py-0.5 rounded bg-amber-200/70">
                    ~
                    {Math.round(
                      new Blob([
                        JSON.stringify({
                          classesList,
                          students,
                          documents,
                          homeworks,
                          homeworkSubmissions,
                          examPapers,
                        }),
                      ]).size / 1024
                    )}{" "}
                    KB
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Hệ thống đã kích hoạt <b>3 lớp bảo vệ</b>: Lưu bản nhẹ tức thì vào{" "}
                  <code>localStorage</code> + Lưu toàn bộ vào <code>IndexedDB</code> + Kiểm tra{" "}
                  <code>lastUpdatedTs</code> siêu nhẹ (15 bytes) giúp tiết kiệm 99% băng thông
                  Firebase.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCleanFirebaseStorage}
                    className="px-3 py-2.5 rounded-xl bg-[#9C6644] text-white font-bold hover:bg-[#7d5035] shadow-sm text-center"
                  >
                    🧹 Dọn nhẹ tệp Base64 trên Firebase (Giữ nguyên Lớp & HS)
                  </button>
                  <button
                    type="button"
                    onClick={handleExportBackupJSON}
                    className="px-3 py-2.5 rounded-xl bg-[#2C4A3E] text-white font-bold hover:bg-[#1B3B48] shadow-sm text-center"
                  >
                    📦 Tải bản Sao lưu (.JSON) về máy
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => fetchFromFirebase(false)}
                  className="px-4 py-2 rounded-xl bg-[#EFECE6] text-[#1B3B48] font-bold hover:bg-[#E5E0D8]"
                >
                  🔄 Kiểm tra & Tải dữ liệu mới nhất từ Cloud
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveToAll();
                    alert("✓ Đã lưu cưỡng bức toàn bộ dữ liệu lên Local, IndexedDB & Firebase!");
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1B3B48] text-white font-bold hover:bg-[#2C4A3E]"
                >
                  ☁ Đẩy dữ liệu hiện tại lên Cloud ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: XEM TRƯỚC & GỬI EMAIL THÔNG BÁO                       */}
      {/* ============================================================== */}
      {emailPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F7F6F2] border border-[#D5CFC4] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
              <h3 className="font-serif font-bold text-base text-[#1B3B48]">
                ✉ Gửi Email Thông Báo Học Tập
              </h3>
              <button
                onClick={() => setEmailPreviewModal(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>
            <div>
              <span className="font-bold text-stone-600">Người nhận: </span>
              <span className="font-mono text-[#1B3B48]">{emailPreviewModal.to}</span>
            </div>
            <div>
              <span className="font-bold text-stone-600">Tiêu đề: </span>
              <span className="font-semibold text-[#1B3B48]">{emailPreviewModal.subject}</span>
            </div>
            <pre className="p-3 rounded-xl bg-white border border-[#E5E0D8] whitespace-pre-wrap font-sans text-xs max-h-60 overflow-y-auto">
              {emailPreviewModal.body}
            </pre>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEmailPreviewModal(null)}
                className="px-4 py-2 rounded-lg border border-[#D5CFC4]"
              >
                Đóng
              </button>
              <a
                href={`mailto:${emailPreviewModal.to}?subject=${encodeURIComponent(
                  emailPreviewModal.subject
                )}&body=${encodeURIComponent(emailPreviewModal.body)}`}
                className="px-4 py-2 rounded-lg bg-[#1B3B48] text-white font-bold"
              >
                🚀 Mở Ứng dụng Mail để Gửi
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#E5E0D8] bg-[#EFECE6] py-6 px-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-[#1B3B48] font-serif">{TEACHER_INFO.brandTitle}</strong> — Giáo
            viên: <b>{TEACHER_INFO.fullName}</b> ({TEACHER_INFO.subNote})
          </div>
          <div className="font-mono text-[11px]">
            Chuẩn Danh pháp Quốc tế IUPAC (GDPT 2018) • Bảo vệ dữ liệu 3 lớp (Local + IndexedDB +
            Smart Firebase)
          </div>
        </div>
      </footer>
    </div>
  );
}

