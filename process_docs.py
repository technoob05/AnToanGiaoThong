import os
import re
import json
from zipfile import ZipFile
from docx import Document

# 👉 Thay đường dẫn thật của bạn ở đây
DOCX_PATH = r"D:\react-ai-template-main\public\HangA1.docx"
EXTRACT_DIR = r"D:\react-ai-template-main\public\extracted"
IMAGE_DIR   = os.path.join(EXTRACT_DIR, "images")
JSON_OUTPUT = os.path.join(EXTRACT_DIR, "questions_with_images.json")

# Tạo thư mục cần thiết
os.makedirs(IMAGE_DIR, exist_ok=True)

# 1. Trích xuất ảnh từ DOCX
def extract_images(docx_path, extract_to, image_dir):
    with ZipFile(docx_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    media_folder = os.path.join(extract_to, "word", "media")
    images = []
    if os.path.isdir(media_folder):
        for img_name in sorted(os.listdir(media_folder)):
            src = os.path.join(media_folder, img_name)
            dst = os.path.join(image_dir, img_name)
            with open(src, 'rb') as fsrc, open(dst, 'wb') as fdst:
                fdst.write(fsrc.read())
            images.append(dst)
    return images

# 2. Đọc và parse câu hỏi, options, explanation, gán ảnh
def parse_questions(docx_path, image_paths):
    doc = Document(docx_path)
    questions = []
    current = None
    img_idx = 0

    for para in doc.paragraphs:
        text = para.text.strip()
        # Bắt đầu câu hỏi mới
        m = re.match(r"Câu( hỏi)?\s*(\d+):\s*(.*)", text)
        if m:
            # Lưu câu trước
            if current:
                questions.append(current)
            # Tạo mới
            current = {
                "id": int(m.group(2)),
                "question": m.group(3),
                "options": [],
                "image": None,
                "explanation": None
            }
            continue

        # Nếu là option
        if current and re.match(r"^(1\.|2\.|3\.|4\.|Cả ý|Cả hai)", text):
            current["options"].append(text)
            continue

        # Nếu là explanation
        if current and text.lower().startswith("giải thích"):
            current["explanation"] = text.split(":",1)[1].strip()
            continue

        # Nếu là ảnh (xuất hiện trong XML)
        if current and para._element.xml.find("<w:drawing") != -1:
            if img_idx < len(image_paths):
                current["image"] = os.path.basename(image_paths[img_idx])
                img_idx += 1
            continue

        # Nếu là phần nối tiếp của question (không phải option/explanation)
        if current and not current["explanation"] and text:
            current["question"] += " " + text

    # Thêm câu cuối
    if current:
        questions.append(current)
    return questions

if __name__ == "__main__":
    # 1) Trích ảnh
    imgs = extract_images(DOCX_PATH, EXTRACT_DIR, IMAGE_DIR)
    # 2) Parse câu hỏi
    qs = parse_questions(DOCX_PATH, imgs)
    # 3) Lưu JSON
    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(qs, f, ensure_ascii=False, indent=2)
    print(f"✅ Hoàn tất: {len(qs)} câu hỏi đã được xuất ra\n- JSON: {JSON_OUTPUT}\n- Ảnh: {IMAGE_DIR}")
