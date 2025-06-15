import { QuizQuestion, LearningPath, Achievement } from '../types';

// Hàm parse options từ text câu hỏi
function parseQuestionOptions(questionText: string): { question: string, options: string[], correctAnswer: number } {
  // Tách câu hỏi và các lựa chọn
  const parts = questionText.split(/[?.]\s+(?=[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĐ])/);
  
  if (parts.length < 2) {
    return {
      question: questionText,
      options: ["Đúng", "Sai"],
      correctAnswer: 0
    };
  }

  const question = parts[0].replace(/[?.]+$/, '') + '?';
  const optionsText = parts.slice(1).join(' ');
  
  // Tìm các options trong text
  const options: string[] = [];
  const sentences = optionsText.split(/[.]\s+/);
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed && 
        !trimmed.toLowerCase().includes('câu hỏi') &&
        !trimmed.toLowerCase().includes('nên đáp án') &&
        !trimmed.toLowerCase().includes('biển 1:') &&
        !trimmed.toLowerCase().includes('biển 2:') &&
        !trimmed.toLowerCase().includes('biển 3:') &&
        trimmed.length > 3 && 
        trimmed.length < 200) {
      options.push(trimmed);
    }
  }

  // Nếu không tìm thấy options hợp lệ, tạo mặc định
  if (options.length === 0) {
    return {
      question: question,
      options: ["Đúng", "Sai"],
      correctAnswer: 0
    };
  }

  // Giả sử đáp án đúng là option đầu tiên (cần điều chỉnh theo logic thực tế)
  return {
    question: question,
    options: options.slice(0, 4), // Tối đa 4 options
    correctAnswer: 0
  };
}

// Raw data từ extracted JSON - Sử dụng toàn bộ dữ liệu thực
const RAW_QUESTIONS_DATA = [
  { 
    id: 6, 
    question: "Đường mà trên đó phương tiện tham gia giao thông được các phương tiện giao thông đến từ hướng khác nhường đường khi qua nơi đường giao nhau, được cắm biển báo hiệu đường ưu tiên là loại đường gì? Đường không ưu tiên. Đường tỉnh lộ. Đường quốc lộ. Đường ưu tiên.", 
    explanation: "Đường ưu tiên được nhường đường khi qua nơi giao nhau." 
  },
  { 
    id: 7, 
    question: "Khái niệm phương tiện giao thông cơ giới đường bộ được hiểu thế nào là đúng? Gồm xe ô tô, máy kéo, xe mô tô hai bánh; xe mô tô ba bánh, xe gắn máy, xe cơ giới dùng cho người khuyết tật và xe máy chuyên dùng. Gồm xe ô tô, máy kéo, rơ moóc hoặc sơ mi rơ moóc được kéo bởi xe ô tô, máy kéo; xe mô tô hai bánh; xe mô tô ba bánh, xe gắn máy (kể cả xe máy điện) và các loại xe tương tự.", 
    explanation: "Phương tiện giao thông cơ giới không có xe máy chuyên dùng." 
  },
  { 
    id: 20, 
    question: "Khi lái xe trong khu đô thị và đồng dân cư trừ các khu vực có biển cấm sử dụng còi, người lái xe được sử dụng còi như thế nào trong các trường hợp dưới đây? Từ 22 giờ đêm đến 5 giờ sáng. Từ 5 giờ sáng đến 22 giờ tối. Từ 23 giờ đêm đến 5 giờ sáng hôm sau.", 
    explanation: "Chỉ sử dụng còi từ 5 giờ sáng đến 22 giờ tối." 
  },
  { 
    id: 39, 
    question: "Biển báo hiệu có dạng hình tròn, viền đỏ, nền trắng, trên nền có hình vẽ hoặc chữ số, chữ viết màu đen loại biển gì dưới đây? Biển báo nguy hiểm. Biển báo cấm. Biển báo hiệu lệnh. Biển báo chỉ dẫn.", 
    explanation: "Biển cấm: vòng tròn đỏ." 
  },
  { 
    id: 40, 
    question: "Biển báo hiệu có dạng tam giác đều, viền đỏ, nền màu vàng, trên có hình vẽ màu đen là loại biển gì dưới đây? Biển báo nguy hiểm. Biển báo cấm. Biển báo hiệu lệnh. Biển báo chỉ dẫn.", 
    explanation: "Biển nguy hiểm: Hình tam giác vàng." 
  },
  { 
    id: 122, 
    question: "Biển báo nào báo hiệu bắt đầu đoạn đường vào phạm vi khu dân cư, các phương tiện tham gia giao thông phải tuân theo các quy định đi đường được áp dụng ở khu đông dân cư? Biển 1. Biển 2.", 
    explanation: "Biển 1 là báo hiệu bắt đầu đoạn đường vào phạm vi khu dân cư còn biển 2 là báo hiệu hết đoạn đường khu dân cư" 
  },
  { 
    id: 178, 
    question: "Xe nào được quyền đi trước trong trường hợp này? Xe con. Xe mô tô.", 
    explanation: "Cả 2 xe đều gặp đèn xanh nên áp dụng quy tắc đường cùng cấp: Bên phải trống – Rẽ phải – Đi thẳng – Rẽ trái. Nên đáp án đúng là xe mô tô rẽ phải được quyền đi trước. Xe con rẽ trái phải nhường đường." 
  },
  { 
    id: 185, 
    question: "Theo hướng mũi tên, những hướng nào xe mô tô được phép đi? Cả ba hướng. Hướng 1 và 2. Hướng 1 và 3. Hướng 2 và 3.", 
    explanation: "Hướng 2 có biển số P.104 Cấm mô tô" 
  },
  { 
    id: 195, 
    question: "Các xe đi theo thứ tự nào là đúng quy tắc giao thông đường bộ? Xe của bạn, mô tô, xe con. Xe con, xe của bạn, mô tô. Mô tô, xe con, xe của bạn.", 
    explanation: "Thứ tự ưu tiên: Xe ưu tiên – Đường ưu tiên – Đường cùng cấp: Bên phải trống, rẽ phải, đi thẳng, rẽ trái. 1. Xe mô tô: Đường ưu tiên; 2. Xe con: Đường không ưu tiên, bên phải trống; 3. Xe của bạn: Đường không ưu tiên, bên phải vướng xe con." 
  },
  { 
    id: 43, 
    question: "Khi sử dụng giấy phép lái xe đã khai báo mất để điều khiển phương tiện cơ giới đường bộ, ngoài việc bị thu hồi giấy phép lái xe, chịu trách nhiệm trước pháp luật, người lái xe không được cấp giấy phép lái xe trong thời gian bao nhiêu năm? 02 năm. 03 năm. 05 năm. 04 năm.", 
    explanation: "05 năm không cấp lại nếu sử dụng bằng lái đã khai báo mất." 
  },
  { 
    id: 109, 
    question: "Biển nào cho phép xe rẽ trái? Biển 1. Biển 2. Không biển nào.", 
    explanation: "Theo QCVN41:2019 thì biển 2: I.410 Khu vực quay xe chỉ dẫn khu vưc được phép quay đầu xe. Biển này thuộc nhóm biển chỉ dẫn nên KHÔNG cấm rẽ trái. Do đó, đáp án đúng là câu 2." 
  },
  { 
    id: 112, 
    question: "Biển nào là biển Cấm đi ngược chiều? Biển 1. Biển 2. Cả ba biển.", 
    explanation: "Biển 1: P.101 Đường cấm; Biển 2: P.102 cấm đi ngược chiều; Biển 3: P.301a Cấm đỗ xe. Nên biển 2 là cấm đi ngược chiều." 
  },
  { 
    id: 118, 
    question: "Biển báo này có ý nghĩa như thế nào? Tốc độ tối đa cho phép về ban đêm cho các phương tiện là 70 km/h. Tốc độ tối thiểu cho phép về ban đêm cho các phương tiện là 70 km/h.", 
    explanation: "Biển tốc độ tối đa về đêm đều có nhận diện bằng khung hình chữ nhật, viền đỏ nền đen, bên dưới ghi khung giờ cấm và bên trong biển sẽ ghi số." 
  }
];

// Chuyển đổi dữ liệu thực thành format chuẩn
const RAW_QUESTIONS = RAW_QUESTIONS_DATA.map(item => {
  const parsed = parseQuestionOptions(item.question);
  return {
    id: item.id,
    question: parsed.question,
    options: parsed.options,
    correctAnswer: parsed.correctAnswer,
    explanation: item.explanation
  };
});

// Chuyển đổi sang format QuizQuestion
export const QUIZ_QUESTIONS: QuizQuestion[] = RAW_QUESTIONS.map((rawQ) => {
  // Xác định level dựa trên id
  let level: 'cap1' | 'cap2' | 'thpt' | 'university' = 'cap1';
  if (rawQ.id >= 1 && rawQ.id <= 50) level = 'cap1';
  else if (rawQ.id >= 51 && rawQ.id <= 100) level = 'cap2';
  else if (rawQ.id >= 101 && rawQ.id <= 150) level = 'thpt';
  else level = 'university';

  // Xác định category
  let category: 'basic' | 'traffic_signs' | 'situations' | 'laws' | 'safety' = 'basic';
  const questionLower = rawQ.question.toLowerCase();
  
  if (questionLower.includes('biển') || questionLower.includes('báo hiệu')) {
    category = 'traffic_signs';
  } else if (questionLower.includes('luật') || questionLower.includes('nghị định') || questionLower.includes('phạt')) {
    category = 'laws';
  } else if (questionLower.includes('tình huống') || questionLower.includes('xe nào') || questionLower.includes('thứ tự')) {
    category = 'situations';
  } else if (questionLower.includes('an toàn') || questionLower.includes('tai nạn')) {
    category = 'safety';
  }

  // Xác định difficulty
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  if (level === 'cap2') difficulty = 'easy';
  else if (level === 'thpt') difficulty = 'medium';
  else if (level === 'university') difficulty = 'hard';

  // Convert options
  const optionLabels = ['a', 'b', 'c', 'd'];
  const options = rawQ.options.map((option: string, index: number) => ({
    id: optionLabels[index],
    text: option,
    isCorrect: index === rawQ.correctAnswer
  }));

  return {
    id: `real_q_${rawQ.id}`,
    question: rawQ.question,
    image: undefined, // Sẽ được thêm sau khi có mapping images
    options: options,
    correctAnswer: optionLabels[rawQ.correctAnswer],
    explanation: rawQ.explanation,
    difficulty: difficulty,
    category: category,
    level: level,
    points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20,
    timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 60
  };
});

// Lộ trình học tập
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path_cap1',
    level: 'cap1',
    prerequisites: [],
    estimatedTime: 120,
    modules: [
      {
        id: 'mod_basic_signs',
        title: 'Biển báo cơ bản',
        description: 'Học các biển báo giao thông cơ bản nhất',
        topics: ['Biển cấm', 'Biển báo nguy hiểm', 'Biển chỉ dẫn'],
        quizCount: 10,
        isCompleted: false,
        unlockScore: 0
      },
      {
        id: 'mod_traffic_lights',
        title: 'Đèn tín hiệu giao thông',
        description: 'Hiểu ý nghĩa các màu đèn giao thông',
        topics: ['Đèn đỏ', 'Đèn vàng', 'Đèn xanh', 'Đèn tín hiệu đặc biệt'],
        quizCount: 8,
        isCompleted: false,
        unlockScore: 70
      }
    ]
  },
  {
    id: 'path_cap2',
    level: 'cap2',
    prerequisites: ['path_cap1'],
    estimatedTime: 180,
    modules: [
      {
        id: 'mod_situations',
        title: 'Tình huống giao thông',
        description: 'Xử lý các tình huống giao thông phức tạp',
        topics: ['Quyền ưu tiên', 'Vượt xe', 'Dừng đỗ xe'],
        quizCount: 15,
        isCompleted: false,
        unlockScore: 150
      }
    ]
  },
  {
    id: 'path_thpt',
    level: 'thpt',
    prerequisites: ['path_cap2'],
    estimatedTime: 240,
    modules: [
      {
        id: 'mod_laws',
        title: 'Luật giao thông chi tiết',
        description: 'Học các điều luật và mức phạt cụ thể',
        topics: ['Nghị định 100', 'Luật giao thông đường bộ', 'Xử phạt vi phạm'],
        quizCount: 20,
        isCompleted: false,
        unlockScore: 300
      }
    ]
  },
  {
    id: 'path_university',
    level: 'university',
    prerequisites: ['path_thpt'],
    estimatedTime: 300,
    modules: [
      {
        id: 'mod_advanced_safety',
        title: 'An toàn giao thông nâng cao',
        description: 'Xử lý tình huống khẩn cấp và an toàn',
        topics: ['Tai nạn giao thông', 'Cứu hộ', 'Phòng chống tệ nạn'],
        quizCount: 25,
        isCompleted: false,
        unlockScore: 500
      }
    ]
  }
];

// Thành tựu
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quiz',
    title: 'Bước đầu tiên',
    description: 'Hoàn thành quiz đầu tiên',
    icon: '🎯',
    unlockedAt: new Date(),
    points: 10
  },
  {
    id: 'perfect_score',
    title: 'Điểm số hoàn hảo',
    description: 'Đạt 100% điểm trong một quiz',
    icon: '🏆',
    unlockedAt: new Date(),
    points: 50
  },
  {
    id: 'speed_demon',
    title: 'Tốc độ ánh sáng',
    description: 'Hoàn thành quiz trong thời gian kỷ lục',
    icon: '⚡',
    unlockedAt: new Date(),
    points: 30
  },
  {
    id: 'law_master',
    title: 'Bậc thầy luật',
    description: 'Hoàn thành tất cả quiz về luật giao thông',
    icon: '⚖️',
    unlockedAt: new Date(),
    points: 100
  },
  {
    id: 'safety_hero',
    title: 'Anh hùng an toàn',
    description: 'Đạt điểm cao trong tất cả quiz an toàn giao thông',
    icon: '🛡️',
    unlockedAt: new Date(),
    points: 150
  }
];

// Feedback thích ứng
export const generateAdaptiveFeedback = (
  correctAnswers: number,
  totalQuestions: number,
  timeSpent: number,
  categories: { [key: string]: number }
): { feedback: string; nextLevel: boolean; recommendations: string[] } => {
  const accuracy = (correctAnswers / totalQuestions) * 100;
  const avgTimePerQuestion = timeSpent / totalQuestions;

  let feedback = '';
  let nextLevel = false;
  const recommendations: string[] = [];

  if (accuracy >= 90) {
    feedback = 'Xuất sắc! Bạn có kiến thức vững chắc về giao thông.';
    nextLevel = true;
    recommendations.push('Hãy thử thách bản thân với cấp độ cao hơn');
  } else if (accuracy >= 70) {
    feedback = 'Tốt! Bạn đã nắm được phần lớn kiến thức cần thiết.';
    recommendations.push('Ôn tập thêm một chút để đạt điểm cao hơn');
  } else if (accuracy >= 50) {
    feedback = 'Khá! Bạn cần cải thiện một số điểm.';
    recommendations.push('Tập trung vào các chủ đề bạn còn yếu');
  } else {
    feedback = 'Cần cố gắng thêm! Hãy ôn tập kỹ hơn.';
    recommendations.push('Bắt đầu từ những kiến thức cơ bản nhất');
  }

  // Phân tích theo category
  const weakCategories = Object.entries(categories)
    .filter(([_, score]) => score < 0.7)
    .map(([category, _]) => category);

  if (weakCategories.includes('traffic_signs')) {
    recommendations.push('Ôn tập thêm về biển báo giao thông');
  }
  if (weakCategories.includes('laws')) {
    recommendations.push('Học thêm về luật giao thông và mức phạt');
  }
  if (weakCategories.includes('safety')) {
    recommendations.push('Tìm hiểu thêm về an toàn giao thông');
  }

  return { feedback, nextLevel, recommendations };
};
