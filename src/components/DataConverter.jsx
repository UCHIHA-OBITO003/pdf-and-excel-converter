import { useState } from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const DataConverter = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  // Sample data that would come from backend
  const sampleData = [
    {
      "MSISDN": "96899961669",
      "IMEI": "32023201072783",
      "IMSI": "422023201072783",
      "FULL NAME": "Maryam ﻣﺮﻳﻡ Ahmad",
      "CARRIER": "OmanTel",
      "SUBSCRIPTION START": "2014-01-23 13:16:00",
      "SUBSCRIPTION END": "2024-01-23 13:16:00",
      "CUSTOMER ID": "ID_5783630556",
      "NATIONALITY": "Arabic",
      "DATE OF BIRTH": "1990-01-23 00:00:00",
      "GENDER": "Female",
      "ADDRESS": "Muscat, Oman"
    }
  ]

  const fetchData = async () => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Setting data:', sampleData)
      setData(sampleData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Customer Data')
    
    // Generate filename with timestamp
    const filename = `customer_data_${new Date().toISOString().split('T')[0]}.xlsx`
    
    // Save file
    XLSX.writeFile(wb, filename)
  }

  const exportToPDF = async () => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    setPdfLoading(true)
    try {
      // First create Excel file
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)
      
      // Set column widths for better formatting
      const colWidths = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length, 15) }))
      ws['!cols'] = colWidths
      
      XLSX.utils.book_append_sheet(wb, ws, 'Customer Data')
      
      // Create HTML table manually to ensure data is properly displayed
      const headers = Object.keys(data[0])
      const rows = data.map(row => Object.values(row))
      
       // Calculate dynamic width based on content
       const totalColumns = headers.length
       const minColumnWidth = 120 // Minimum width per column
       const dynamicWidth = Math.max(totalColumns * minColumnWidth, 1000) // At least 1000px
       
       console.log('PDF Conversion - Headers:', headers)
       console.log('PDF Conversion - Rows:', rows)
       console.log('Total columns:', totalColumns)
       console.log('Dynamic width:', dynamicWidth)
       
       let htmlTable = `<table id="excel-table" style="border-collapse: collapse; width: ${dynamicWidth}px; border: 1px solid #000;">`
      
       // Add header row
       htmlTable += '<thead><tr>'
       headers.forEach(header => {
         htmlTable += `<th style="background-color: #2980b9; color: white; padding: 10px; border: 1px solid #000; font-weight: bold; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${header}</th>`
       })
       htmlTable += '</tr></thead>'
      
       // Add data rows
       htmlTable += '<tbody>'
       rows.forEach(row => {
         htmlTable += '<tr>'
         row.forEach(cell => {
           htmlTable += `<td style="padding: 8px; border: 1px solid #000; word-wrap: break-word; color: #000000; font-size: 14px; font-family: Arial, Helvetica, sans-serif; font-weight: normal;">${cell || ''}</td>`
         })
         htmlTable += '</tr>'
       })
       htmlTable += '</tbody></table>'
      
       // Create a temporary container for the table
       const tempDiv = document.createElement('div')
       tempDiv.innerHTML = htmlTable
       tempDiv.style.position = 'absolute'
       tempDiv.style.left = '-2000px'
       tempDiv.style.top = '0px'
       tempDiv.style.width = `${dynamicWidth}px`
       tempDiv.style.backgroundColor = 'white'
       tempDiv.style.fontFamily = 'Arial, Helvetica, sans-serif'
       tempDiv.style.fontSize = '14px'
       tempDiv.style.fontWeight = 'normal'
       tempDiv.style.lineHeight = '1.2'
       tempDiv.style.zIndex = '9999'
       tempDiv.style.opacity = '1'
       tempDiv.style.pointerEvents = 'none'
       tempDiv.style.visibility = 'visible'
       tempDiv.style.webkitFontSmoothing = 'antialiased'
       tempDiv.style.mozOsxFontSmoothing = 'grayscale'
      
      document.body.appendChild(tempDiv)
      
      // Log the HTML table for debugging
      console.log('Generated HTML Table:', tempDiv.innerHTML)
      
      // Small delay to ensure DOM is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100))
      
       // Convert HTML to canvas then to PDF
       const canvas = await html2canvas(tempDiv, {
         scale: 2,
         useCORS: true,
         backgroundColor: '#ffffff',
         allowTaint: true,
         foreignObjectRendering: false,
         logging: false,
         width: dynamicWidth,
         height: tempDiv.scrollHeight,
         scrollX: 0,
         scrollY: 0,
         dpi: 300,
         letterRendering: true
       })
      
       // Remove temporary element
       document.body.removeChild(tempDiv)
       
       // Debug canvas dimensions
       console.log('Canvas dimensions:', canvas.width, 'x', canvas.height)
       console.log('Canvas data URL length:', canvas.toDataURL('image/png').length)
       
       // Create PDF
       const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('l', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Generate filename with timestamp
      const filename = `customer_data_${new Date().toISOString().split('T')[0]}.pdf`
      
      // Save file
      pdf.save(filename)
      
    } catch (error) {
      console.error('Error creating PDF:', error)
      alert('Error creating PDF. Please try again.')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="data-converter">
      <div className="converter-container">
        <h2>Data Converter</h2>
        
        <div className="button-group">
          <button 
            className="fetch-btn" 
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'Fetching Data...' : 'Fetch Data from Backend'}
          </button>
        </div>

        {data && (
          <div className="data-section">
            <h3>Data Preview</h3>
            <div className="debug-info">
              <p>Data length: {data.length}</p>
              <p>First row keys: {Object.keys(data[0]).join(', ')}</p>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((key, index) => (
                      <th key={index}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{value || 'EMPTY'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="export-buttons">
              <button 
                className="export-btn excel-btn" 
                onClick={exportToExcel}
              >
                📊 Export to Excel
              </button>
              <button 
                className="export-btn pdf-btn" 
                onClick={exportToPDF}
                disabled={pdfLoading}
              >
                {pdfLoading ? '⏳ Creating PDF...' : '📄 Export to PDF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataConverter
