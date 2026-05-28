import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IGeneratedPaper } from '../models/Assignment';

export const generateAssignmentPDF = async (
  paper: IGeneratedPaper,
  outputPath: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 50, right: 50 },
        bufferPages: true,
        autoFirstPage: true,
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // --- PAGE HEADER ---
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#111111').text('DELHI PUBLIC SCHOOL', { align: 'center' });
      doc.font('Helvetica').fontSize(10).fillColor('#555555').text('Bokaro Steel City, Jharkhand', { align: 'center' });
      doc.moveDown(0.4);

      // Elegant CBSE standard thin double horizontal line separator
      doc.strokeColor('#CECECE').lineWidth(0.75).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.strokeColor('#CECECE').lineWidth(0.75).moveTo(50, doc.y + 2.5).lineTo(545, doc.y + 2.5).stroke();
      doc.y = doc.y + 6;
      doc.moveDown(0.4);

      // Assessment Title
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#111111').text(paper.title.toUpperCase(), { align: 'center' });
      doc.moveDown(0.6);

      // --- METADATA BOARD TABLE ---
      const metadataY = doc.y;
      doc.strokeColor('#CECECE').lineWidth(0.75).moveTo(50, metadataY).lineTo(545, metadataY).stroke();
      
      doc.y = metadataY + 5;
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#111111');
      doc.text(`SUBJECT: ${paper.subject.toUpperCase()}`, 55, doc.y, { width: 220 });
      doc.text(`TIME ALLOWED: ${paper.duration.toUpperCase()}`, 280, metadataY + 5, { width: 140, align: 'center' });
      doc.text(`MAX MARKS: ${paper.totalMarks}`, 430, metadataY + 5, { width: 110, align: 'right' });
      
      doc.y = metadataY + 18;
      doc.strokeColor('#CECECE').lineWidth(0.75).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.y = doc.y + 6;
      doc.moveDown(0.6);

      // --- STUDENT INFO BOX ---
      const infoY = doc.y;
      doc.rect(50, infoY, 495, 26).strokeColor('#CECECE').lineWidth(0.75).stroke();
      
      doc.font('Helvetica').fontSize(9).fillColor('#111111');
      doc.text('Name: _______________________________', 58, infoY + 8, { width: 220 });
      doc.text('Roll No: ______________', 278, infoY + 8, { width: 120 });
      doc.text('Section: ___________', 418, infoY + 8, { width: 110 });
      
      doc.y = infoY + 26;
      doc.moveDown(0.8);

      // --- GENERAL INSTRUCTIONS (FULL WIDTH) ---
      if (paper.instructions && paper.instructions.length > 0) {
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111').text('General Instructions:', 50);
        doc.font('Helvetica').fontSize(9).fillColor('#444444').moveDown(0.2);
        
        paper.instructions.forEach((inst, index) => {
          doc.text(`${index + 1}. ${inst}`, 50, doc.y, {
            paragraphGap: 3,
            width: 495,
            indent: 12
          });
        });
        
        doc.moveDown(0.6);
        
        // Thin gray line separator
        doc.strokeColor('#E0E0E0').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.y = doc.y + 6;
        doc.moveDown(0.5);
      }

      // --- SECTIONS & QUESTIONS ---
      paper.sections.forEach((section) => {
        // Force new page if section starts very close to the bottom
        if (doc.y > 720) {
          doc.addPage();
        }

        doc.moveDown(0.5);
        // Symmetrical formal section divider inside a soft gray background box
        const sectionY = doc.y;
        doc.rect(50, sectionY, 495, 20).fill('#F2F2F2');
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#111111').text(section.title.toUpperCase(), 50, sectionY + 5, { align: 'center', width: 495 });
        
        doc.y = sectionY + 20;
        doc.moveDown(0.4);
        doc.font('Helvetica-Oblique').fontSize(9).fillColor('#555555').text(section.instruction, 55, doc.y, { width: 485 });
        doc.moveDown(0.6);

        section.questions.forEach((q, qIndex) => {
          // Predictive page break: check if remaining space fits the question (MCQs need more space for options)
          const estimatedNeed = q.type === 'MCQ' ? 100 : 50;
          if (doc.y + estimatedNeed > 750) {
            doc.addPage();
          }

          const questionStartY = doc.y;

          // 1. Draw marks badge in the far right column - clean, formal, black bold brackets!
          doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#111111');
          doc.text(`(${q.marks})`, 485, questionStartY, { width: 60, align: 'right' });

          // 2. Draw question text on the left, constrained so it never overlaps the marks (NO difficulty badges printed!)
          doc.font('Helvetica').fontSize(10).fillColor('#111111');
          doc.text(`Q${qIndex + 1}. ${q.text}`, 50, questionStartY, {
            width: 425,
            align: 'justify'
          });

          doc.moveDown(0.5);

          // If MCQ, render options symmetrically
          if (q.type === 'MCQ' && q.options) {
            doc.font('Helvetica').fontSize(9.5).fillColor('#222222');

            const optX = 70;
            let optY = doc.y;
            
            q.options.forEach((opt, oIndex) => {
              const label = String.fromCharCode(97 + oIndex); // a, b, c, d
              
              if (oIndex % 2 === 0 && oIndex > 0) {
                optY = doc.y;
              }
              
              const xPos = oIndex % 2 === 0 ? optX : optX + 240;
              
              doc.text(`(${label}) ${opt}`, xPos, optY, {
                width: 210,
                lineBreak: true,
              });
              
              if (oIndex % 2 === 1 || oIndex === q.options!.length - 1) {
                doc.y = doc.y + 4; // Add a small spacing
              }
            });
            
            doc.moveDown(0.6);
          } else {
            doc.moveDown(0.8);
          }
        });
      });

      // --- PAGE NUMBERS (must be added before doc.end(), after all content) ---
      // Flush all buffered pages first, then iterate to add page numbers
      // const totalPages = doc.bufferedPageRange().count;
      // for (let i = 0; i < totalPages; i++) {
      //   doc.switchToPage(i);
      //   // Page number at bottom center — within A4 page height (841pt) minus bottom margin
      //   doc.font('Helvetica').fontSize(8).fillColor('#888888');
      //   doc.text(
      //     `Page ${i + 1} of ${totalPages}`,
      //     50,
      //     795,
      //     { align: 'center', width: 495 }
      //   );
      // }

      // --- ANSWER KEY SECTION ---
      doc.addPage();

      // Answer Key header
      const akHeaderY = doc.y;
      doc.rect(50, akHeaderY, 495, 28).fill('#1a1a1a');
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#ffffff')
        .text('ANSWER KEY', 50, akHeaderY + 8, { align: 'center', width: 495 });
      doc.y = akHeaderY + 28;
      doc.moveDown(0.8);

      paper.sections.forEach((section) => {
        // Ensure enough space for the section header
        if (doc.y + 30 > 780) doc.addPage();

        // Section label in answer key
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#444444')
          .text(section.title.toUpperCase(), 50, doc.y, { width: 495 });
        doc.moveDown(0.4);

        section.questions.forEach((q, qIndex) => {
          // Ensure enough space for each answer
          if (doc.y + 40 > 780) doc.addPage();

          const answerStartY = doc.y;

          // Question number badge resets for each section
          doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#111111')
            .text(`Q${qIndex + 1}.`, 50, answerStartY, { width: 30 });

          // Marks badge on right
          doc.font('Helvetica').fontSize(8.5).fillColor('#888888')
            .text(`[${q.marks} mark${q.marks > 1 ? 's' : ''}]`, 500, answerStartY, { width: 45, align: 'right' });

          // Correct answer text
          const answerText = q.correctAnswer || 'Answer not provided.';
          doc.font('Helvetica').fontSize(9.5).fillColor('#222222')
            .text(answerText, 82, answerStartY, { width: 408, align: 'left' });

          doc.moveDown(0.6);

          // Subtle divider between answers
          doc.strokeColor('#EEEEEE').lineWidth(0.5)
            .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
          doc.y += 5;
          doc.moveDown(0.3);
        });

        doc.moveDown(0.4);
      });

      doc.end();

      writeStream.on('finish', () => {
        console.log(`PDF successfully created at: ${outputPath}`);
        resolve(outputPath);
      });

      writeStream.on('error', (error) => {
        console.error('Error writing PDF stream:', error);
        reject(error);
      });

      } catch (err) {
        console.error('Failed generating programmatic PDF:', err);
        reject(err);
      }
  });
};
