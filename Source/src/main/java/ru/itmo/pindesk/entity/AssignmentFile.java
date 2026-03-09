package ru.itmo.pindesk.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_files")
public class AssignmentFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_data", nullable = false, columnDefinition = "bytea")
    private byte[] fileData;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "uploaded_by")
    private Long uploadedBy;

    public AssignmentFile() {}

    public Long getId() { return id; }
    public Long getItemId() { return itemId; }
    public String getFileName() { return fileName; }
    public String getFileType() { return fileType; }
    public Long getFileSize() { return fileSize; }
    public byte[] getFileData() { return fileData; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public Long getUploadedBy() { return uploadedBy; }

    public void setItemId(Long itemId) { this.itemId = itemId; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public void setUploadedBy(Long uploadedBy) { this.uploadedBy = uploadedBy; }
}
