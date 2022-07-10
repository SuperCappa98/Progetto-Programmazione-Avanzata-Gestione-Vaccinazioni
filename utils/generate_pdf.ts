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

export function generateTableRow(doc:any, y:any, c1:any, c2:any, c3:any, c4:any, table_type:string) {
	doc.fontSize(10)
    doc.markContent('Span', {lang:"it-IT"});
    if(table_type == "VaccinationTable") {
        doc
            .text(c1, 50, y) // vaccine name
            .text(c2, 150, y) // batch
            .text(c3, 280, y) // coverage
            .text(c4, 370, y, { width: 140, align: 'right' }); // timestamp
    }else if(table_type == "CoverageDataUserTable") {
        doc
            .text(c1, 50, y) // vaccine name
            .text(c2, 130, y) // days to coverage expiration
            .text(c3, 290, y) // days from coverage expiration
            .text(c4, 410, y, { width: 140, align: 'right' }); // timestamp last vaccination
    }
    doc.endMarkedContent();
}

export function generateVaccinationTable(doc:any, vaccination:any) {
	let i;
	const tableTop = 350;

    doc.font("Helvetica-Bold");
        generateTableRow(
        doc,
        tableTop,
        "Vaccino",
        "Lotto",
        "Copertura (gg)",
        "Timestamp",
        "VaccinationTable"
    );

    generateHr(doc, tableTop + 20);

    doc.font("Helvetica");
	for (i = 0; i < vaccination.length; i++) {
		const item = vaccination[i];
		const position = tableTop + (i + 1) * 30;
		generateTableRow(
			doc,
			position,
			item.vaccine_name,
			item.batch,
			item.coverage,
			item.timestamp_vc,
            "VaccinationTable"
		);
	}


}

export function generateCoverageDataUserTable(doc:any, coverage_data_user:any) {
	let i;
	const tableTop = 350;

    doc.font("Helvetica-Bold");
        generateTableRow(
        doc,
        tableTop,
        "Vaccino",
        "Copertura scade tra (gg)",
        "Copertura scaduta da (gg)",
        "Timestamp ultima vacc.",
        "CoverageDataUserTable"
    );

    generateHr(doc, tableTop + 20);

    doc.font("Helvetica");
	for (i = 0; i < coverage_data_user.length; i++) {
		const item = coverage_data_user[i];
		const position = tableTop + (i + 1) * 30;
		generateTableRow(
			doc,
			position,
			item.vaccine_name,
			item.days_to_coverage,
			item.days_from_coverage,
			item.last_vaccination_timestamp,
            "CoverageDataUserTable"
		);
	}


}
