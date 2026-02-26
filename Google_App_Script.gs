// Huong dan cai dat Google Sheet va App Script:
// Ban doc file HD_GoogleSheet.md trong thu muc nhe
// --

function doPost(e) {
  var response = { status: 'error', message: 'Loi xay ra vui long thu lai' };
  
  try {
    var data = e.parameter;
    
    // Nếu data rỗng, có thể khách gửi dạng JSON, thử parse lại
    if (Object.keys(data).length === 0 && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch(err) {}
    }

    var sheetName = '';
    
    // Phan biet giua Loi chuc (wish) va RSVP (rsvp)
    if(data.type === 'wish') {
      sheetName = 'LoiChuc';
    } else if(data.type === 'rsvp') {
      sheetName = 'RSVP';
    } else {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Loại dữ liệu không hợp lệ.'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    // Tao sheet moi neu chua co
    if(!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
      if(sheetName === 'LoiChuc') {
        sheet.appendRow(['Thoi gian', 'Ten', 'Loi chuc', 'Icon']);
      } else {
        sheet.appendRow(['Thoi gian', 'Ten', 'Co Tham Du?', 'So Nguoi']);
      }
    }
    
    // Tien hanh them dong
    var timestamp = new Date().toLocaleString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"});
    
    if(data.type === 'wish') {
      sheet.appendRow([timestamp, data.name, data.message, data.icon]);
    } else if(data.type === 'rsvp') {
      sheet.appendRow([timestamp, data.name, data.attendance, data.count]);
    }
    
    // Tra ve JSON thanh cong
    response = { 
       status: 'success', 
       message: 'Thanh cong!',
       data: data
    };
    
  } catch(error) {
    response.message = error.toString();
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}


// Ham de cho khach GET array loi chuc (neu can parse nguoc lai vao thi)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LoiChuc');
    if(!sheet) return ContentService.createTextOutput(JSON.stringify({wishes: []})).setMimeType(ContentService.MimeType.JSON);
    
    var data = sheet.getDataRange().getValues();
    var wishes = [];
    
    // Bo qua muc title (dong 1) nguoc len
    for(var i = data.length - 1; i > 0; i--) {
      var row = data[i];
      // Tra ve 50 loi chuc gan nhat de HTML nhe
      if(wishes.length >= 50) break;
      
      wishes.push({
         name: row[1],
         message: row[2],
         icon: row[3] || '❤️'
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ wishes: wishes }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({wishes: []}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
