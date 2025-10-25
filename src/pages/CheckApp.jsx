import { useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardBody } from "../components/ui/Card.jsx";
import { Label, Input } from "../components/ui/Inputs.jsx";
import { Button, GhostButton } from "../components/ui/Buttons.jsx";
import { Toggle } from "../components/ui/Toggle.jsx";
import { fmtDate } from "../lib/format.js";
import { emptyFields } from "../lib/constants.js";
import { abaChecksumOk, wordsToNumberDemo } from "../lib/micr.js";

// Fallback nếu môi trường không có crypto.randomUUID
const uid =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? () => crypto.randomUUID()
    : () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function CheckApp({ history, setHistory }) {
  const fileInputRef = useRef(null);
  const [stage, setStage] = useState("idle"); // idle | review
  const [dragOver, setDragOver] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [fields, setFields] = useState(emptyFields);
  const [loadingExtract, setLoadingExtract] = useState(false);

  // NEW: bật để cho phép lưu dù checksum routing sai
  const [skipRouting, setSkipRouting] = useState(false);

  const routingOk = useMemo(
    () => abaChecksumOk(fields.routing_number),
    [fields.routing_number]
  );
  const amountMatch = useMemo(() => {
    const parsed = wordsToNumberDemo(fields.amount_words);
    if (parsed === "") return true;
    const an = parseFloat(String(fields.amount_numeric || "").replace(/,/g, ""));
    return Math.abs((an || 0) - parsed) < 0.01;
  }, [fields.amount_words, fields.amount_numeric]);

  function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      setStage("review");
      setLoadingExtract(true);
      // Demo dữ liệu giả lập — thay bằng gọi API thật
      setTimeout(() => {
        const demo = {
          bank_name: "JP Morgan Chase & Co.",
          routing_number: "983356001", // cố tình checksum sai như ảnh mẫu
          account_number: "7741488526",
          check_number: "5688562",
          date: "2024-06-26",
          payer_name: "Joseph Cooper",
          address: "3714 Darlene Ports, Port Davidton, CT 31205",
          payee: "Cortez Inc",
          amount_numeric: "5992.90",
          amount_words:
            "Five Thousand, Nine Hundred And Ninety-Two Dollars and 90/100",
          memo: "Front-line 5thgeneration hierarchy",
          signature_present: true,
        };
        setFields(demo);
        setLoadingExtract(false);
      }, 800);
    };
    reader.readAsDataURL(file);

    const item = {
      id: uid(),
      name: file.name,
      size: file.size,
      ts: Date.now(),
      thumb: null,
      fields: emptyFields,
    };
    setHistory((h) => [item, ...h].slice(0, 50));
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFiles(e.dataTransfer?.files);
  }
  function onSelectFile(e) {
    handleFiles(e.target.files);
    e.target.value = "";
  }

  function saveToHistory() {
    const entry = {
      id: uid(),
      name:
        (fields?.payer_name && fields.payer_name.trim()) ||
        "(Chưa có tên người rút)",
      ts: Date.now(),
      thumb: imageSrc,
      fields,
    };
    setHistory((h) => [entry, ...h]);
  }

  // Quan trọng: cho phép lưu nếu routing hợp lệ HOẶC đã bật skipRouting
  const allRequiredOk =
    fields.routing_number &&
    (routingOk || skipRouting) &&
    fields.account_number &&
    fields.check_number &&
    fields.amount_numeric &&
    fields.payee &&
    imageSrc;

  return (
    <div className="max-w-7xl mx-auto flex gap-6 px-4 py-6">
      {/* Left Sidebar: Upload History */}
      <aside className="w-64 shrink-0">
        <Card>
          <CardHeader
            title="Lịch sử tra cứu"
            right={<span className="text-xs text-slate-500">{history.length}</span>}
          />
          <CardBody className="p-0">
            {history.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">Chưa có mục nào.</div>
            ) : (
              <ul className="divide-y">
                {history.map((h) => (
                  <li
                    key={h.id}
                    className="p-3 hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                      setStage("review");
                      setFields(h.fields || emptyFields);
                      setImageSrc(h.thumb || imageSrc);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 bg-slate-200 rounded-md overflow-hidden flex items-center justify-center">
                        {h.thumb ? (
                          <img
                            src={h.thumb}
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            className="text-slate-500"
                          >
                            <path
                              fill="currentColor"
                              d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7Z"
                            />
                            <path
                              fill="currentColor"
                              d="M14 3v2h3.59L9.29 13.29l1.42 1.42L19 6.41V10h2V3h-7Z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {(h.fields?.payer_name &&
                            h.fields.payer_name.trim()) ||
                            h.name ||
                            "Chưa có tên người rút"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {fmtDate(h.ts)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </aside>

      {/* Main Area */}
      <main className="flex-1">
        {stage === "idle" ? (
          <Card className="h-[70vh] flex items-center justify-center">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={
                "border-2 border-dashed rounded-2xl p-10 text-center max-w-xl w-full " +
                (dragOver
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-slate-300 bg-slate-50")
              }
            >
              <div className="flex flex-col items-center gap-4">
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  className="text-slate-500"
                >
                  <path
                    fill="currentColor"
                    d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7Z"
                  />
                  <path
                    fill="currentColor"
                    d="M14 3v2h3.59L9.29 13.29l1.42 1.42L19 6.41V10h2V3h-7Z"
                  />
                </svg>
                <div className="text-lg font-medium">
                  Drop document here to upload
                </div>
                <div className="text-sm text-slate-500">hoặc</div>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Select from device
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={onSelectFile}
                />
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Original image */}
            <Card className="h-[70vh] flex flex-col">
              <CardHeader
                title="Ảnh séc gốc"
                right={
                  <GhostButton onClick={() => setStage("idle")}>
                    Tải ảnh khác
                  </GhostButton>
                }
              />
              <CardBody className="flex-1 overflow-auto flex items-center justify-center bg-slate-50">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-sm text-slate-500">Chưa có ảnh.</div>
                )}
              </CardBody>
            </Card>

            {/* Right: Fields */}
            <Card className="h-[70vh] flex flex-col">
              <CardHeader
                title="Thông tin trích xuất"
                right={
                  loadingExtract ? (
                    <span className="text-xs text-slate-500">
                      Đang nhận dạng…
                    </span>
                  ) : (
                    <span />
                  )
                }
              />
              <CardBody className="flex-1 overflow-auto space-y-4">
                {/* Bank + Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Ngân hàng phát hành</Label>
                    <Input
                      value={fields.bank_name}
                      onChange={(e) =>
                        setFields({ ...fields, bank_name: e.target.value })
                      }
                      placeholder="ACME Bank"
                    />
                  </div>
                  <div>
                    <Label>Ngày séc / Cheque date</Label>
                    <Input
                      type="date"
                      value={fields.date}
                      onChange={(e) =>
                        setFields({ ...fields, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Payer + Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Payer name</Label>
                    <Input
                      value={fields.payer_name}
                      onChange={(e) =>
                        setFields({ ...fields, payer_name: e.target.value })
                      }
                      placeholder="Joseph Cooper"
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={fields.address}
                      onChange={(e) =>
                        setFields({ ...fields, address: e.target.value })
                      }
                      placeholder="3714 Darlene Ports, Port Davidton, CT 31205"
                    />
                  </div>
                </div>

                {/* Payee + Memo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Payee name</Label>
                    <Input
                      value={fields.payee}
                      onChange={(e) =>
                        setFields({ ...fields, payee: e.target.value })
                      }
                      placeholder="Cortez Inc"
                    />
                  </div>
                  <div>
                    <Label>Ghi chú (Memo)</Label>
                    <Input
                      value={fields.memo}
                      onChange={(e) =>
                        setFields({ ...fields, memo: e.target.value })
                      }
                      placeholder="Front-line 5thgeneration hierarchy"
                    />
                  </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Số tiền (số) / Amount in figures</Label>
                    <Input
                      inputMode="decimal"
                      value={fields.amount_numeric}
                      onChange={(e) =>
                        setFields({
                          ...fields,
                          amount_numeric: e.target.value,
                        })
                      }
                      placeholder="5992.90"
                    />
                  </div>
                  <div>
                    <Label>Số tiền (chữ) / Amount in words</Label>
                    <Input
                      value={fields.amount_words}
                      onChange={(e) =>
                        setFields({
                          ...fields,
                          amount_words: e.target.value,
                        })
                      }
                      placeholder="Five Thousand, Nine Hundred And Ninety-Two Dollars and 90/100"
                    />
                    {!amountMatch && (
                      <div className="text-xs text-rose-600 mt-1">
                        Cảnh báo: Số tiền chữ không khớp số.
                      </div>
                    )}
                  </div>
                </div>

                {/* MICR */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Routing number (ABA)</Label>
                    <Input
                      value={fields.routing_number}
                      onChange={(e) =>
                        setFields({
                          ...fields,
                          routing_number: e.target.value
                            .replace(/[^\d]/g, "")
                            .slice(0, 9),
                        })
                      }
                      placeholder="9 digits"
                    />
                    {fields.routing_number && (
                      <div
                        className={`text-xs mt-1 ${
                          routingOk ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {routingOk
                          ? "Checksum hợp lệ"
                          : "Checksum không hợp lệ"}
                      </div>
                    )}
                    {/* NEW: công tắc bỏ qua checksum */}
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        id="skipRouting"
                        type="checkbox"
                        className="h-4 w-4"
                        checked={skipRouting}
                        onChange={(e) => setSkipRouting(e.target.checked)}
                      />
                      <label
                        htmlFor="skipRouting"
                        className="text-xs text-slate-600"
                      >
                        Bỏ qua kiểm tra checksum
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label>Account number</Label>
                    <Input
                      value={fields.account_number}
                      onChange={(e) =>
                        setFields({
                          ...fields,
                          account_number: e.target.value
                            .replace(/[^\d]/g, "")
                            .slice(0, 17),
                        })
                      }
                      placeholder="7741488526"
                    />
                  </div>
                  <div>
                    <Label>Check #</Label>
                    <Input
                      value={fields.check_number}
                      onChange={(e) =>
                        setFields({
                          ...fields,
                          check_number: e.target.value
                            .replace(/[^\d]/g, "")
                            .slice(0, 8),
                        })
                      }
                      placeholder="5688562"
                    />
                  </div>
                </div>

                {/* Signature */}
                <div className="flex items-center gap-3 pt-2">
                  <Toggle
                    checked={fields.signature_present}
                    onChange={(v) =>
                      setFields({ ...fields, signature_present: v })
                    }
                  />
                  <span className="text-sm">Chữ ký hiện diện</span>
                </div>
              </CardBody>

              {/* Footer */}
              <div className="px-4 py-3 border-t bg-white rounded-b-2xl flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Các trường bắt buộc: Routing, Account, Check #, Payee, Amount
                </div>
                <div className="flex items-center gap-3">
                  <GhostButton onClick={() => setFields(emptyFields)}>
                    Xóa
                  </GhostButton>
                  <Button
                    disabled={!allRequiredOk}
                    onClick={() => {
                      saveToHistory();
                      alert(
                        "✅ Đã xác nhận & lưu JSON (demo). Hãy nối API thật ở phần backend."
                      );
                    }}
                    aria-label="Xác nhận & Lưu"
                    title="Xác nhận & Lưu"
                  >
                    {"\u2705"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom uploader (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={onSelectFile}
      />
    </div>
  );
}
