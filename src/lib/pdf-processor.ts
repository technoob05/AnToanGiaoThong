// PDF parsing is handled server-side for production
// Using mock data for browser demo

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    page: number;
    section?: string;
    article?: string;
    source: string;
  };
}

export class PDFProcessor {
  private static instance: PDFProcessor;
  private documents: DocumentChunk[] = [];
  private isProcessed = false;

  static getInstance(): PDFProcessor {
    if (!PDFProcessor.instance) {
      PDFProcessor.instance = new PDFProcessor();
    }
    return PDFProcessor.instance;
  }

  async processPDF(_filePath: string): Promise<DocumentChunk[]> {
    if (this.isProcessed) {
      return this.documents;
    }

    // For browser environment, use mock data directly
    // PDF processing would require server-side implementation
    console.log('Using mock traffic law data for browser demo');
    this.documents = this.createMockDocuments();
    this.isProcessed = true;
    
    console.log('Created', this.documents.length, 'mock law chunks');
    return this.documents;
  }

  // These methods are kept for future PDF processing functionality
  // Currently unused in the mock implementation
  // private splitByLegalSections(text: string): string[] {
  //   // Split by common Vietnamese legal patterns
  //   const patterns = [
  //     /(?=Điều\s+\d+)/g,           // Articles
  //     /(?=Khoản\s+\d+)/g,         // Clauses  
  //     /(?=Chương\s+[IVX]+)/g,     // Chapters
  //     /(?=Mục\s+\d+)/g,           // Sections
  //     /(?=\d+\.\s)/g,             // Numbered items
  //   ];
  //   
  //   let sections = [text];
  //   
  //   patterns.forEach(pattern => {
  //     const newSections: string[] = [];
  //     sections.forEach(section => {
  //       const parts = section.split(pattern);
  //       newSections.push(...parts);
  //     });
  //     sections = newSections;
  //   });
  //   
  //   // Also split by length if chunks are too long
  //   const maxChunkLength = 1000;
  //   const finalSections: string[] = [];
  //   
  //   sections.forEach(section => {
  //     if (section.length <= maxChunkLength) {
  //       finalSections.push(section);
  //     } else {
  //       // Split long sections by sentences
  //       const sentences = section.split(/[.!?]\s+/);
  //       let currentChunk = '';
  //       
  //       sentences.forEach(sentence => {
  //         if ((currentChunk + sentence).length <= maxChunkLength) {
  //           currentChunk += sentence + '. ';
  //         } else {
  //           if (currentChunk) finalSections.push(currentChunk.trim());
  //           currentChunk = sentence + '. ';
  //         }
  //       });
  //       
  //       if (currentChunk) finalSections.push(currentChunk.trim());
  //     }
  //   });
  //   
  //   return finalSections;
  // }

  // private extractSectionInfo(text: string): string | undefined {
  //   const sectionMatch = text.match(/(?:Chương|Mục)\s+([IVX\d]+)/i);
  //   return sectionMatch ? sectionMatch[0] : undefined;
  // }

  // private extractArticleInfo(text: string): string | undefined {
  //   const articleMatch = text.match(/Điều\s+(\d+)/i);
  //   return articleMatch ? articleMatch[0] : undefined;
  // }

  private createMockDocuments(): DocumentChunk[] {
    // Comprehensive mock data based on Vietnamese traffic law
    return [
      {
        id: 'mock_1',
        content: 'Điều 8. Vi phạm quy tắc giao thông đường bộ bị xử phạt hành chính theo quy định của pháp luật về xử lý vi phạm hành chính. Người vi phạm quy tắc giao thông đường bộ gây thiệt hại cho người khác phải bồi thường theo quy định của pháp luật.',
        metadata: {
          page: 1,
          article: 'Điều 8',
          source: 'Luật Giao thông đường bộ Việt Nam'
        }
      },
      {
        id: 'mock_2', 
        content: 'Điều 61. Người điều khiển xe ô tô, máy kéo phải có Giấy phép lái xe phù hợp với loại xe được phép điều khiển. Độ tuổi tối thiểu của người lái xe ô tô là 18 tuổi đối với xe có khối lượng dưới 3.500 kg và 21 tuổi đối với các loại xe khác.',
        metadata: {
          page: 15,
          article: 'Điều 61',
          source: 'Luật Giao thông đường bộ Việt Nam'
        }
      },
      {
        id: 'mock_3',
        content: 'Điều 33. Người điều khiển phương tiện giao thông đường bộ phải tuân thủ tín hiệu của đèn giao thông, biển báo hiệu, vạch kẻ đường và chỉ dẫn của người điều khiển giao thông. Việc vượt đèn đỏ bị nghiêm cấm và sẽ bị xử phạt theo Nghị định 100/2019/NĐ-CP với mức phạt từ 4.000.000 đến 6.000.000 đồng và tước bằng lái xe từ 1 đến 3 tháng.',
        metadata: {
          page: 8,
          article: 'Điều 33',
          source: 'Luật Giao thông đường bộ Việt Nam'
        }
      },
      {
        id: 'mock_4',
        content: 'Nghị định 100/2019/NĐ-CP quy định mức phạt tiền đối với hành vi vi phạm quy tắc giao thông đường bộ. Phạt tiền từ 4.000.000 đồng đến 6.000.000 đồng đối với người điều khiển xe ô tô vi phạm quy tắc về đèn tín hiệu giao thông (vượt đèn đỏ). Tước quyền sử dụng Giấy phép lái xe từ 01 đến 03 tháng.',
        metadata: {
          page: 25,
          section: 'Nghị định 100/2019/NĐ-CP',
          article: 'Điều 5',
          source: 'Luật Giao thông đường bộ Việt Nam'
        }
      },
      {
        id: 'mock_5',
        content: 'Điều 58. Người điều khiển xe mô tô, xe gắn máy phải đội mũ bảo hiểm có cài quai đúng quy cách. Trẻ em dưới 6 tuổi không được ngồi trên xe mô tô, xe gắn máy khi tham gia giao thông. Việc không đội mũ bảo hiểm bị phạt từ 100.000 đến 200.000 đồng theo Nghị định 100/2019/NĐ-CP.',
        metadata: {
          page: 14,
          article: 'Điều 58',
          source: 'Luật Giao thông đường bộ Việt Nam'
        }
      },
      {
        id: 'mock_6',
        content: 'Nghị định 100/2019/NĐ-CP Điều 7. Phạt tiền từ 100.000 đồng đến 200.000 đồng đối với người điều khiển xe mô tô, xe gắn máy không đội mũ bảo hiểm hoặc đội mũ bảo hiểm không cài quai đúng quy cách khi tham gia giao thông đường bộ.',
        metadata: {
          page: 27,
          section: 'Nghị định 100/2019/NĐ-CP',
          article: 'Điều 7',
          source: 'Luật Giao thông đường bộ Việt Nam'
        }
      },
      {
        id: 'mock_7',
        content: 'Điều 60. Độ tuổi tối thiểu của người lái xe mô tô hai bánh, xe gắn máy là 16 tuổi. Người lái xe mô tô ba bánh là 18 tuổi. Người lái xe ô tô tối thiểu 18 tuổi đối với loại xe dưới 3.500kg và 21 tuổi đối với xe trên 3.500kg.',
        metadata: {
          page: 14,
          article: 'Điều 60',
          source: 'Luật Giao thông đường bộ Việt Nam'
        }
      },
      {
        id: 'mock_8',
        content: 'Nghị định 100/2019/NĐ-CP Điều 6. Phạt tiền từ 10.000.000 đồng đến 12.000.000 đồng đối với người điều khiển xe ô tô có nồng độ cồn vượt quá 50mg/100ml máu hoặc 0,25mg/lít khí thở. Tước bằng lái xe từ 10 đến 12 tháng.',
        metadata: {
          page: 26,
          section: 'Nghị định 100/2019/NĐ-CP',
          article: 'Điều 6',
          source: 'Luật Giao thông đường bộ Việt Nam'
        }
      },
      {
        id: 'mock_9',
        content: 'Điều 24. Tốc độ tối đa cho phép của xe ô tô và các loại xe có kết cấu tương tự trên đường cao tốc không vượt quá 120 km/h, trên đường quốc lộ không vượt quá 90 km/h, trên đường đô thị không vượt quá 60 km/h.',
        metadata: {
          page: 6,
          article: 'Điều 24',
          source: 'Luật Giao thông đường bộ Việt Nam'
        }
      },
      {
        id: 'mock_10',
        content: 'Điều 62. Giấy phép lái xe có thời hạn sử dụng. Thời hạn sử dụng Giấy phép lái xe hạng A1, A2, A3, A4 là 10 năm. Thời hạn sử dụng Giấy phép lái xe hạng B1, B2, C, D, E, F là 10 năm đối với người dưới 55 tuổi và 05 năm đối với người từ 55 tuổi trở lên.',
        metadata: {
          page: 16,
          article: 'Điều 62',
          source: 'Luật Giao thông đường bộ Việt Nam'
        }
      }
    ];
  }

  getDocuments(): DocumentChunk[] {
    return this.documents;
  }

  async searchRelevantChunks(query: string, topK: number = 3): Promise<DocumentChunk[]> {
    if (!this.isProcessed) {
      await this.processPDF('/LUAT_DUONG_BO_MOI_NHAT_3276b.pdf');
    }

    // Simple text-based search (we'll enhance this with embeddings later)
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
    
    const scored = this.documents.map(doc => {
      const contentLower = doc.content.toLowerCase();
      let score = 0;
      
      queryTerms.forEach(term => {
        // Exact matches get higher score
        const exactMatches = (contentLower.match(new RegExp(term, 'g')) || []).length;
        score += exactMatches * 2;
        
        // Partial matches
        if (contentLower.includes(term)) {
          score += 1;
        }
      });
      
      // Boost score for legal terms
      const legalTerms = ['điều', 'khoản', 'phạt', 'vi phạm', 'quy định', 'luật'];
      legalTerms.forEach(term => {
        if (contentLower.includes(term) && queryLower.includes(term)) {
          score += 1;
        }
      });
      
      return { ...doc, score };
    });
    
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export const pdfProcessor = PDFProcessor.getInstance();
