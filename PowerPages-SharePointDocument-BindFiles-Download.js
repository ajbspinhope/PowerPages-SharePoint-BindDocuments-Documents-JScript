$(document).ready(function () {
    console.log("Retrieve User docs");

    var userID = "{{ user.id }}";  // Liquid code to get the current user's ID
    console.log("user:", userID);

    var _url = "/_api/cloudflow/v1.0/trigger/g0898975-2867-ef71-a671-6045bd118c0e"; // Here replace this url with your flow which retrieves the SharePoint files

    var data = {};
    data["PortalUserId"] = userID;

    var payload = {};
    payload.eventData = JSON.stringify(data);
   
    shell
        .ajaxSafePost({
            type: "POST",
            url: _url,
            data: payload
        })
        .done(function (response) {
            const parsedResponse = JSON.parse(response);
            const resultString = parsedResponse.result;

            const filesArray = JSON.parse(resultString);
            console.log('Files:', filesArray);

            var table = document.createElement("table");
            table.style.width = "100%";
            table.style.borderCollapse = "collapse";

            var headerRow = document.createElement("tr");

            var headers = ["File Name", "File Size (bytes)", "Download"];
            headers.forEach(function(headerText) {
                var header = document.createElement("th");
                header.textContent = headerText;
                header.style.border = "1px solid #ddd";
                header.style.padding = "8px";
                header.style.textAlign = "left";
                header.style.backgroundColor = "#f2f2f2";
                headerRow.appendChild(header);
            });

            table.appendChild(headerRow);

            filesArray.forEach(function(file) {
                var row = document.createElement("tr");

                var fileNameCell = document.createElement("td");
                fileNameCell.textContent = file.FileName;
                fileNameCell.style.border = "1px solid #ddd";
                fileNameCell.style.padding = "8px";

                var fileSizeCell = document.createElement("td");
                fileSizeCell.textContent = file.FileSize;
                fileSizeCell.style.border = "1px solid #ddd";
                fileSizeCell.style.padding = "8px";

                var downloadCell = document.createElement("td");
                var downloadLink = document.createElement("a");
                downloadLink.href = "#"; 
                downloadLink.textContent = "Download";
                downloadLink.style.color = "#007bff";  
                downloadLink.style.textDecoration = "none";  

                downloadLink.setAttribute("data-file-fileid", file.FileId);

                downloadLink.onclick = function(event) {
                    event.preventDefault();

                    var fileId = event.currentTarget.getAttribute("data-file-fileid");

                    var filePayload = {
                        eventData: JSON.stringify({ PortalUserId: userID, FileId: fileId })
                    };

                    var fileApiUrl = "/_api/cloudflow/v1.0/trigger/7g7cd496-hd59-eh11-g671-8045bd318c0e"; // Here replace this url with your flow which retrieves the file content

                    shell
                        .ajaxSafePost({
                            type: "POST",
                            url: fileApiUrl, 
                            data: filePayload
                        })
                        .done(function(fileResponse) {
                            try {
                                var fileData = JSON.parse(fileResponse);
                                var fileContent = fileData.result;
                                var base64String = "data:application/octet-stream;base64," + fileContent;
                                debugger;
                                // Trigger download
                                var tempLink = document.createElement("a");
                                tempLink.href = base64String;
                                tempLink.download = file.FileName;
                                tempLink.click();
                            } catch (error) {
                                console.error("Error retrieveing file content:", error);
                                alert("Failed to decode file content. The file may be corrupted.");
                            }
                        })
                        .fail(function() {
                            alert("Failed to download the file.");
                        });

                    return false;
                };

                downloadCell.style.border = "1px solid #ddd";
                downloadCell.style.padding = "8px";
                downloadCell.appendChild(downloadLink);

                row.appendChild(fileNameCell);
                row.appendChild(fileSizeCell);
                row.appendChild(downloadCell);

                table.appendChild(row);
            });

            var fileListContainer = document.getElementById("fileListContainer");
            fileListContainer.innerHTML = "";  
            fileListContainer.appendChild(table);
        })
        .fail(function (result) {
            alert("Failed to retrieve files.");
            console.log('Failed:', result);
        });
});
