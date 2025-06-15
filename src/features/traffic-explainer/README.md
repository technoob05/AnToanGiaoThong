# Traffic Explainer - Trợ Lý Giải Thích An Toàn Giao Thông

## Mô tả
Tính năng AI Explainer giúp giải thích các khái niệm, quy tắc và tình huống về an toàn giao thông một cách sinh động và dễ hiểu.

## Cấu hình

### 1. Cài đặt API Key
Tạo file `.env` trong thư mục gốc và thêm:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Lấy API Key từ Google AI Studio
1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Copy và paste vào file `.env`

## Tính năng chính

### 🎯 Giải thích trực quan
- Chia nhỏ khái niệm phức tạp thành các phần dễ hiểu
- Sử dụng ví dụ thực tế từ giao thông Việt Nam
- Hiển thị dưới dạng cards tương tác

### 🤖 AI thông minh
- Sử dụng Google Gemini Pro
- Tự động tạo nội dung phù hợp với người Việt
- Phản hồi nhanh và chính xác

### 📱 Giao diện thân thiện
- Thiết kế responsive
- Màu sắc tương thích với chủ đề an toàn giao thông
- Hoạt ảnh mượt mà và thu hút

## Cách sử dụng

1. **Nhập câu hỏi**: Gõ câu hỏi về an toàn giao thông
2. **Chọn mẫu**: Hoặc click vào các câu hỏi mẫu có sẵn
3. **Nhận giải thích**: AI sẽ tạo ra bài giải thích chi tiết
4. **Xem kết quả**: Đọc qua các thẻ giải thích được tạo ra

## Ví dụ câu hỏi

- "Tại sao phải đội mũ bảo hiểm khi đi xe máy?"
- "Tác hại của việc vượt đèn đỏ"
- "Những biển báo giao thông quan trọng nhất"
- "Cách phòng tránh tai nạn giao thông"

## Cấu trúc thư mục

```
src/features/traffic-explainer/
├── components/
│   └── TrafficExplainerInterface.tsx
├── hooks/ (if needed)
├── utils/ (if needed)
├── types.ts (if needed)
└── README.md
```

## Công nghệ sử dụng

- **React 19**: Framework chính
- **TypeScript**: Đảm bảo type safety
- **Google Gemini AI**: Trí tuệ nhân tạo
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **marked**: Markdown parser

## Lưu ý kỹ thuật

- Component được tối ưu hóa cho hiệu suất
- Xử lý lỗi và loading states
- Responsive design cho mọi thiết bị
- Tuân thủ accessibility standards

## Đóng góp

Khi phát triển thêm tính năng:
1. Giữ nguyên cấu trúc thư mục
2. Thêm TypeScript types khi cần
3. Đảm bảo responsive design
4. Test trên nhiều thiết bị khác nhau 