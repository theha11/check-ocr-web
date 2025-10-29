import { useMemo, useRef, useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "../components/ui/Card.jsx";
import { Label, Input } from "../components/ui/Inputs.jsx";
import { Button, GhostButton } from "../components/ui/Buttons.jsx";
import { Toggle } from "../components/ui/Toggle.jsx";
import { fmtDate } from "../lib/format.js";
import { emptyFields } from "../lib/constants.js";
import { getHistory, addHistory, updateHistory, deleteHistory } from "../lib/api.js";

// Fallback nếu môi trường không có crypto.randomUUID
const uid =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? () => crypto.randomUUID()
    : () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function CheckApp({ history, setHistory, user }) {
  // Load history from API on mount
  useEffect(() => {
    if (user) {
      console.log('Loading history for user:', user.username);
      getHistory()
        .then(data => {
          console.log('Loaded history:', data);
          setHistory(data);
        })
        .catch(err => {
          console.error('Failed to load history:', err);
        });
    }
  }, [user]);
  const fileInputRef = useRef(null);
  const [stage, setStage] = useState("idle"); // idle | review
  const [dragOver, setDragOver] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [fields, setFields] = useState(emptyFields);
  const [loadingExtract, setLoadingExtract] = useState(false);

  // Sắp xếp lịch sử theo thời gian mới nhất
  const visibleHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [history]
  );

  function handleFiles(fileList) {
    if (!user) {
      alert('Please sign in to process checks');
      return;
    }

    const file = fileList?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target.result;
      setImageSrc(imageSrc);
      setStage("review");

      // Giả lập trích xuất (thay bằng API thật của bạn)
      setLoadingExtract(true);
      setTimeout(async () => {
        const demo = {
          bank_name: "JP Morgan Chase & Co.",
          routing_number: "983356001",
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
        
        // Save to history with image
        try {
          const historyItem = await addHistory(demo.payer_name, { 
            fields: demo,
            image: imageSrc // Lưu ảnh vào history
          });
          setHistory(prev => [historyItem, ...prev]);
        } catch (err) {
          console.error('Failed to save history:', err);
        }
        
        setLoadingExtract(false);
      }, 800);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setLoadingExtract(false);
    };
    reader.readAsDataURL(file);

    // ❌ Không thêm mục “nháp” vào lịch sử tại đây
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

  async function saveToHistory() {
    if (!user) {
      alert('Please sign in to save history');
      return;
    }

    // Tạo nội dung hiển thị từ tên người rút hoặc người nhận
    const content = (fields?.payer_name && fields.payer_name.trim()) || 
                   (fields?.payee && fields.payee.trim()) ||
                   "Chưa có tên người rút";
    
    try {
      // Lưu vào API với đầy đủ thông tin
      const historyItem = await addHistory(content, {
        fields: fields,
        image: imageSrc
      });
      
      // Cập nhật state với dữ liệu mới
      setHistory((prev) => [historyItem, ...prev]);
      
      // Thông báo thành công
      alert("✅ Đã lưu thành công");
    } catch (err) {
      console.error('Failed to save history:', err);
      alert('Không thể lưu. Vui lòng thử lại.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto flex gap-6 px-4 py-6">
      {/* Left Sidebar: Upload History */}
      <aside className="w-64 shrink-0">
        <Card>
          <CardHeader
            title="Lịch sử tra cứu"
            right={
              <span className="text-xs text-slate-500">
                {visibleHistory.length}
              </span>
            }
          />
          <CardBody className="p-0">
            {visibleHistory.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">Chưa có mục nào.</div>
            ) : (
              <ul className="divide-y">
                {visibleHistory.map((h) => (
                  <li
                    key={h.id}
                    className="p-3 hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                      setStage("review");
                      // Sử dụng fields từ meta
                      setFields(h.meta?.fields || emptyFields);
                      // Sử dụng ảnh từ meta
                      setImageSrc(h.meta?.image || null);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 bg-slate-200 rounded-md overflow-hidden flex items-center justify-center">
                        {h.meta?.image ? (
                          <img
                            src={h.meta.image}
                            className="object-cover h-full w-full"
                            alt="Check thumbnail"
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
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {(h.meta?.fields?.payer_name &&
                            h.meta.fields.payer_name.trim()) ||
                            h.content ||
                            "Chưa có tên người rút"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {fmtDate(h.created_at)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newContent = prompt("Nhập nội dung mới:", h.content);
                            if (newContent != null) {
                              updateHistory(h.id, newContent, h.meta)
                                .then(() => {
                                  setHistory(prev => prev.map(item => 
                                    item.id === h.id 
                                      ? { ...item, content: newContent }
                                      : item
                                  ));
                                })
                                .catch(err => {
                                  console.error('Failed to update history:', err);
                                  alert('Không thể cập nhật. Vui lòng thử lại.');
                                });
                            }
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Sửa"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Bạn có chắc muốn xóa mục này không?")) {
                              deleteHistory(h.id)
                                .then(() => {
                                  setHistory(prev => prev.filter(item => item.id !== h.id));
                                })
                                .catch(err => {
                                  console.error('Failed to delete history:', err);
                                  alert('Không thể xóa. Vui lòng thử lại.');
                                });
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Xóa"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                            />
                          </svg>
                        </button>
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
                  Nhấn ✅ để lưu lại mục này
                </div>
                <div className="flex items-center gap-3">
                  <GhostButton onClick={() => setFields(emptyFields)}>
                    Xóa
                  </GhostButton>
                  <Button
                    onClick={() => {
                      saveToHistory();
                      alert("✅ Đã lưu (demo). Hãy nối API thật ở backend.");
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
