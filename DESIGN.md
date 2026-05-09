# Flood Rescue Coordination and Relief Management System
## System Architecture & Design Documentation

Tài liệu này mô tả chi tiết về cấu trúc dữ liệu (Class Diagram) và luồng hoạt động chính (Flowchart) của Hệ thống Điều phối Cứu hộ và Quản lý Cứu trợ Lũ lụt.

---

### 1. Sơ đồ mô hình lớp dữ liệu (Class Diagram)
Sơ đồ dưới đây thể hiện các thực thể chính trong hệ thống và mối quan hệ giữa chúng, bao gồm Quản lý người dùng, Đội cứu hộ, Yêu cầu cứu hộ, Hàng cứu trợ và Điểm an toàn.

```mermaid
classDiagram
    class User {
        +Long id
        +String username
        +String passwordHash
        +String fullName
        +String email
        +String phone
        +String status
        +LocalDateTime createdAt
    }
    
    class Role {
        +Long id
        +String name
        +String description
    }
    
    class RescueTeam {
        +Long teamId
        +String teamName
        +Integer memberCount
        +String contactPhone
        +String status
        +String currentLocation
    }
    
    class RescueVehicle {
        +Long vehicleId
        +String name
        +String type
        +String licensePlate
        +Integer capacity
        +String status
    }
    
    class RescueRequest {
        +Long id
        +String description
        +String location
        +Double latitude
        +Double longitude
        +String urgencyLevel
        +String status
        +LocalDateTime createdTime
    }
    
    class ReliefItem {
        +Long id
        +String name
        +String category
        +String unit
        +Integer quantityInStock
        +Integer minimumStockLevel
    }
    
    class ReliefDistribution {
        +Long id
        +Integer quantityDistributed
        +LocalDateTime distributionDate
    }
    
    class Shelter {
        +Long id
        +String name
        +String location
        +Integer capacity
        +Integer currentOccupancy
        +String status
    }
    
    class FloodAlert {
        +Long id
        +String title
        +String severity
        +String locationArea
        +LocalDateTime startTime
    }

    User "n" --> "1" Role : Has
    RescueRequest "n" --> "1" User : Created by (Citizen)
    RescueRequest "n" --> "1" RescueTeam : Assigned to
    RescueVehicle "n" --> "1" RescueTeam : Used by
    ReliefDistribution "n" --> "1" RescueRequest : Distributed for
    ReliefDistribution "n" --> "1" ReliefItem : Distributes
    FloodAlert "n" --> "1" User : Created by (Admin/Manager)
```

---

### 2. Sơ đồ luồng nghiệp vụ cốt lõi (Flowchart)
Sơ đồ dưới đây mô tả luồng nghiệp vụ quan trọng nhất của hệ thống: **Tiếp nhận và xử lý yêu cầu cứu hộ khẩn cấp.**

```mermaid
flowchart TD
    %% Định nghĩa các Actor
    Citizen([Người dân / Citizen])
    Coord([Điều phối viên / Coordinator])
    Team([Đội cứu hộ / Rescue Team])
    
    %% Luồng tạo yêu cầu
    Citizen -->|Tạo Rescue Request qua Web| Sys_Receive(Hệ thống tiếp nhận yêu cầu)
    Sys_Receive -->|Lưu DB trạng thái PENDING| DB_Req[(Database)]
    Sys_Receive -->|Bắn thông báo| Coord
    
    %% Luồng điều phối
    Coord -->|Đăng nhập & Xem danh sách| Sys_Dashboard(Dashboard Yêu cầu Cứu hộ)
    Sys_Dashboard -->|Phân tích mức độ khẩn cấp| Coord_Action{Chọn đội cứu hộ?}
    
    Coord_Action -->|Phân công| Assign(Assign to Rescue Team)
    Assign -->|Cập nhật trạng thái ASSIGNED| DB_Req
    Assign -->|Gửi Notification| Team
    
    %% Luồng thực thi của đội cứu hộ
    Team -->|Xác nhận nhận việc| Update_InProg(Cập nhật IN_PROGRESS)
    Update_InProg -->|Di chuyển đến vị trí| Exec_Rescue[Thực hiện cứu hộ / Cứu trợ]
    
    Exec_Rescue -->|Cần hàng cứu trợ?| Check_Relief{Phân phát hàng?}
    Check_Relief -->|Có| Distribute(Tạo Relief Distribution)
    Distribute -->|Trừ tồn kho| DB_Inventory[(Kho hàng)]
    Check_Relief -->|Không| Complete_Action
    
    Distribute --> Complete_Action
    
    %% Luồng kết thúc
    Complete_Action(Hoàn thành nhiệm vụ) -->|Cập nhật trạng thái COMPLETED| DB_Req
    Complete_Action -->|Thông báo cho người dân| End_Citizen([Người dân an toàn])
    
    %% Style
    style Citizen fill:#f9f,stroke:#333,stroke-width:2px
    style Coord fill:#bbf,stroke:#333,stroke-width:2px
    style Team fill:#bfb,stroke:#333,stroke-width:2px
    style DB_Req fill:#fbb,stroke:#333,stroke-width:2px
```

---

### 3. Phân quyền Hệ thống (Role-Based Access Control)

| Vai trò (Role) | Chức năng chính được phép |
| :--- | :--- |
| **ADMIN** | Quản lý toàn bộ hệ thống, quản lý tài khoản người dùng, xem thống kê tổng hợp. |
| **COORDINATOR** | Xem tất cả yêu cầu cứu hộ, điều phối Đội cứu hộ (Rescue Team) đi làm nhiệm vụ, thay đổi trạng thái yêu cầu. |
| **MANAGER** | Quản lý kho hàng cứu trợ (Relief Items), quản lý phương tiện cứu hộ (Vehicles) và Điểm an toàn (Shelters), phát Cảnh báo lũ. |
| **RESCUER** | (Đội cứu hộ) Xem các nhiệm vụ được phân công, cập nhật trạng thái nhiệm vụ (Đang đi, Đã xong), cập nhật phát hàng cứu trợ. |
| **CITIZEN** | (Người dân) Gửi yêu cầu cứu hộ khẩn cấp, xem trạng thái yêu cầu của mình, nhận cảnh báo lũ lụt và tìm điểm an toàn. |
