const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

const { Service, Booking } = require('../models');

// Generate PDF Report of Bookings Grouped by Month
router.get('/bookings-report', async (req, res) => {
    try {
        // Fetch all services for mapping IDs to names
        const allServices = await Service.findAll();
        const serviceMap = {};
        allServices.forEach(s => {
            serviceMap[s.id] = s.name.trim();
        });

        // Fetch services with bookings
        const services = await Service.findAll({
            include: [{
                model: Booking,
                required: true  // Only services with bookings
            }]
        });

        // Collect all bookings with month info
        let allRows = [];
        for (const service of services) {
            for (const booking of service.Bookings) {
                let additionalNames = 'None';
                if (booking.additionalServices) {
                    try {
                        let additionalIds = booking.additionalServices;
                        if (typeof additionalIds === 'string') {
                            try {
                                additionalIds = JSON.parse(additionalIds);
                            } catch {
                                additionalIds = parseInt(additionalIds);
                            }
                        }
                        if (typeof additionalIds === 'number' && !isNaN(additionalIds)) {
                            additionalIds = [additionalIds];
                        }
                        if (Array.isArray(additionalIds) && additionalIds.length > 0) {
                            additionalNames = additionalIds
                                .map(id => serviceMap[id] || `ID:${id}`)
                                .join(', ');
                        }
                    } catch (e) {
                        additionalNames = 'Invalid Data';
                    }
                }

                // Extract month in "YYYY-MM" format
                const bookingDate = new Date(booking.bookingDate);
                const month = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;

                allRows.push({
                    month,
                    serviceName: service.name,
                    bookingDate: booking.bookingDate,
                    totalAmount: booking.totalAmount,
                    photographerId: booking.photographerId || 'N/A',
                    additionalServices: additionalNames
                });
            }
        }

        // Sort by month, then by booking date
        allRows.sort((a, b) => {
            if (a.month === b.month) {
                return new Date(a.bookingDate) - new Date(b.bookingDate);
            }
            return a.month.localeCompare(b.month);
        });

        // Create PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.pdf');
        doc.pipe(res);

        // Title
        doc.fontSize(18).text('Bookings Report', { align: 'center' });
        doc.moveDown();

        // Table headers
        doc.fontSize(12).text('Month', 30, doc.y, { continued: true })
            .text('Service Name', 90, doc.y, { continued: true })
            .text('Booking Date', 220, doc.y, { continued: true })
            .text('Total Amount', 320, doc.y, { continued: true })
            .text('Photographer ID', 410, doc.y, { continued: true })
            .text('Additional Services', 510, doc.y);
        doc.moveDown(0.5);

        // Table rows with empty row for new month
        let prevMonth = null;
        allRows.forEach(row => {
            if (prevMonth && row.month !== prevMonth) {
                doc.moveDown(0.5); // Empty row
            }
            doc.text(row.month, 30, doc.y, { continued: true })
                .text(row.serviceName, 90, doc.y, { continued: true })
                .text(row.bookingDate, 220, doc.y, { continued: true })
                .text(row.totalAmount, 320, doc.y, { continued: true })
                .text(row.photographerId, 410, doc.y, { continued: true })
                .text(row.additionalServices, 510, doc.y);
            prevMonth = row.month;
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF report:', error);
        res.status(500).json({ error: 'Failed to generate PDF report' });
    }
});

module.exports = router;