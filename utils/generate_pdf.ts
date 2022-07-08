const PDFDocument = require('pdfkit');
const fs = require('fs');

  

export function generateHeader(doc:any) {
    
	doc.image('utils/logo.png', 50, 45, { width: 80 })
		.fillColor('#444444')
		.fontSize(10)
		.text('Viale Regina Elena 299', 200, 65, { align: 'right' })
		.text('Roma, RM, 00161', 200, 80, { align: 'right' })
		.moveDown();
    
}

export function generateHr(doc:any, y:any) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  
export function generateCustomerInformation(doc:any, user_key:string) {
    doc.markContent('Span', {lang:"it-IT"});
    doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Identificativo Utente", 50, 160);

    generateHr(doc, 185);
    doc.endMarkedContent();

    doc.markContent('Span', {lang:"it-IT"});
    const userInformationTop = 200;
    doc
    .fontSize(10)
    .text("Codice Fiscale:", 50, userInformationTop)
    .font("Helvetica-Bold")
    .text(user_key, 150, userInformationTop)
	.moveDown();
    generateHr(doc, 225);
    doc.endMarkedContent();

}

export function generateTableRow(doc:any, y:any, c1:any, c2:any, c3:any, c4:any) {
	doc.fontSize(10)
    doc.markContent('Span', {lang:"it-IT"});
    doc
		.text(c1, 50, y) // vaccine name
		.text(c2, 150, y) // batch
		.text(c3, 280, y) // coverage
		.text(c4, 370, y, { width: 140, align: 'right' }) // timestamp
		//.text(c5, 0, y, { align: 'right' });
    doc.endMarkedContent();
}

export function generateInvoiceTable(doc:any, invoice:any) {
	let i;
	const invoiceTableTop = 350;

    doc.font("Helvetica-Bold");
        generateTableRow(
        doc,
        invoiceTableTop,
        "Vaccino",
        "Lotto",
        "Copertura (gg)",
        "Timestamp",
        //"Line Total"
    );

    generateHr(doc, invoiceTableTop + 20);

    doc.font("Helvetica");
	for (i = 0; i < invoice.length; i++) {
		const item = invoice[i];
		const position = invoiceTableTop + (i + 1) * 30;
		generateTableRow(
			doc,
			position,
			item.vaccine_name,
			item.batch,
			item.coverage,
			item.timestamp_vc,
			// item.amount,
		);
	}


}
