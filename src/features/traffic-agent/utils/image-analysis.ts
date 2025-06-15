/**
 * Image analysis utilities using Gemini API for traffic report validation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageAnalysisResult, ReportType } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Analyze uploaded image to determine if it's traffic-related and identify issues
 */
export const analyzeTrafficImage = async (imageFile: File): Promise<ImageAnalysisResult> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Convert file to base64
    const imageBase64 = await fileToBase64(imageFile);
    
    const prompt = `
      Analyze this image to determine if it shows traffic safety issues. Please evaluate:
      
      1. Is this image related to traffic/road infrastructure?
      2. What specific traffic safety issues can you identify? (check for):
         - Faded or missing road markings/lines
         - Potholes or damaged road surface
         - Broken or malfunctioning traffic lights
         - Missing or damaged traffic signs
         - Road debris or obstacles
         - Other traffic hazards
      
      3. Rate your confidence (0-100) in the traffic safety assessment
      4. Provide a brief description of what you see
      
      Respond in JSON format:
      {
        "isTrafficRelated": boolean,
        "detectedIssues": ["issue1", "issue2"],
        "confidence": number,
        "description": "description of what you see"
      }
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageFile.type
        }
      },
      prompt
    ]);

    const responseText = result.response.text();
    
    try {
      const analysis = JSON.parse(responseText);
      return {
        isTrafficRelated: analysis.isTrafficRelated || false,
        detectedIssues: analysis.detectedIssues || [],
        confidence: analysis.confidence || 0,
        description: analysis.description || 'Unable to analyze image'
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return {
        isTrafficRelated: false,
        detectedIssues: [],
        confidence: 0,
        description: 'Failed to analyze image'
      };
    }
  } catch (error) {
    console.error('Image analysis error:', error);
    return {
      isTrafficRelated: false,
      detectedIssues: [],
      confidence: 0,
      description: 'Failed to analyze image'
    };
  }
};

/**
 * Get object detection and bounding boxes for traffic elements
 */
export const detectTrafficObjects = async (imageFile: File) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const imageBase64 = await fileToBase64(imageFile);

    const prompt = `
      Detect all traffic-related objects in this image and provide their bounding boxes.
      Look for: traffic lights, road signs, vehicles, road markings, potholes, debris.
      
      Return bounding boxes in the format [ymin, xmin, ymax, xmax] normalized to 0-1000.
      Respond in JSON format:
      [
        {
          "object": "traffic_light",
          "confidence": 95,
          "box_2d": [100, 200, 300, 400],
          "description": "Red traffic light"
        }
      ]
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageFile.type
        }
      },
      prompt
    ]);

    const responseText = result.response.text();
    
    try {
      return JSON.parse(responseText);
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Object detection error:', error);
    return [];
  }
};

/**
 * Suggest report type based on image analysis
 */
export const suggestReportType = (analysisResult: ImageAnalysisResult): ReportType | null => {
  const { detectedIssues } = analysisResult;
  
  if (!analysisResult.isTrafficRelated || detectedIssues.length === 0) {
    return null;
  }

  // Map detected issues to report types
  const issueMapping: { [key: string]: ReportType } = {
    'faded': ReportType.FADED_LINES,
    'marking': ReportType.FADED_LINES,
    'line': ReportType.FADED_LINES,
    'pothole': ReportType.POTHOLE,
    'hole': ReportType.POTHOLE,
    'damage': ReportType.BROKEN_ROAD,
    'crack': ReportType.BROKEN_ROAD,
    'light': ReportType.TRAFFIC_LIGHT_ISSUE,
    'traffic light': ReportType.TRAFFIC_LIGHT_ISSUE,
    'sign': ReportType.MISSING_SIGN,
    'debris': ReportType.DEBRIS,
    'obstacle': ReportType.DEBRIS
  };

  // Find the most likely report type
  for (const issue of detectedIssues) {
    const lowerIssue = issue.toLowerCase();
    for (const [keyword, reportType] of Object.entries(issueMapping)) {
      if (lowerIssue.includes(keyword)) {
        return reportType;
      }
    }
  }

  return ReportType.OTHER;
};

/**
 * Validate image quality for traffic reporting
 */
export const validateImageQuality = async (imageFile: File): Promise<{
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const imageBase64 = await fileToBase64(imageFile);

    const prompt = `
      Evaluate this image quality for traffic safety reporting:
      
      Check for:
      1. Is the image clear and not blurry?
      2. Is there sufficient lighting?
      3. Is the traffic issue clearly visible?
      4. Is the image properly oriented?
      5. Are there any obstructions blocking the view?
      
      Respond in JSON format:
      {
        "isValid": boolean,
        "issues": ["issue1", "issue2"],
        "suggestions": ["suggestion1", "suggestion2"]
      }
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageFile.type
        }
      },
      prompt
    ]);

    const responseText = result.response.text();
    
    try {
      const validation = JSON.parse(responseText);
      return {
        isValid: validation.isValid || false,
        issues: validation.issues || [],
        suggestions: validation.suggestions || []
      };
    } catch {
      return {
        isValid: true,
        issues: [],
        suggestions: []
      };
    }
  } catch (error) {
    console.error('Image validation error:', error);
    return {
      isValid: true,
      issues: [],
      suggestions: []
    };
  }
};

/**
 * Convert File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Compress image if it's too large
 */
export const compressImage = async (file: File, maxSizeMB = 5): Promise<File> => {
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.8
      );
    };

    img.src = URL.createObjectURL(file);
  });
}; 