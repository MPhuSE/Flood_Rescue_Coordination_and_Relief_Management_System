import { useState, useEffect } from 'react';

interface RescueRequest {
  requestId: number;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  urgencyLevel: string;
  status: string;
  createdTime: string;
  userName: string;
  assignedTeamName?: string;
}

export default function RescueRequestList() {
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<RescueRequest | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/rescue-requests');
        const data = await response.json();
        if (data.success) {
          setRequests(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleViewDetails = (request: RescueRequest) => {
    setSelectedRequest(request);
  };

  const handleAccept = async (request: RescueRequest) => {
    if (acceptingId === request.requestId) {
      return;
    }

    try {
      setAcceptingId(request.requestId);

      const response = await fetch(
        `http://localhost:8080/api/rescue-requests/${request.requestId}/status?status=IN_PROGRESS`,
        { method: 'PATCH' }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.message || 'Cập nhật trạng thái thất bại');
      }

      setRequests((prev) =>
        prev.map((item) =>
          item.requestId === request.requestId ? { ...item, status: 'IN_PROGRESS' } : item
        )
      );

      setSelectedRequest((prev) =>
        prev && prev.requestId === request.requestId ? { ...prev, status: 'IN_PROGRESS' } : prev
      );
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Không thể cập nhật trạng thái yêu cầu. Vui lòng thử lại.');
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredRequests = filter === 'ALL' 
    ? requests 
    : requests.filter((req: RescueRequest) => req.status === filter);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'ASSIGNED':
        return 'Đã giao';
      case 'IN_PROGRESS':
        return 'Đang xử lý';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Bị hủy';
      case 'REJECTED':
        return 'Bị từ chối';
      default:
        return status;
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'Rất cao';
      case 'HIGH':
        return 'Cao';
      case 'MEDIUM':
        return 'Trung bình';
      case 'LOW':
        return 'Thấp';
      default:
        return level;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Modal Detail */}
        {selectedRequest && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '1rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>
                  Chi tiết yêu cầu #{selectedRequest.requestId}
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Description */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#4b5563',
                    marginBottom: '0.5rem'
                  }}>
                    Mô tả
                  </label>
                  <p style={{
                    backgroundColor: '#f3f4f6',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    color: '#1f2937',
                    lineHeight: '1.5'
                  }}>
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#4b5563',
                    marginBottom: '0.5rem'
                  }}>
                    📍 Địa điểm
                  </label>
                  <p style={{
                    backgroundColor: '#f3f4f6',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    color: '#1f2937'
                  }}>
                    {selectedRequest.location}
                  </p>
                </div>

                {/* Coordinates */}
                {selectedRequest.latitude && selectedRequest.longitude && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#4b5563',
                      marginBottom: '0.5rem'
                    }}>
                      🗺️ Tọa độ
                    </label>
                    <p style={{
                      backgroundColor: '#f3f4f6',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      color: '#1f2937',
                      fontFamily: 'monospace'
                    }}>
                      Vĩ độ: {selectedRequest.latitude.toFixed(6)} | Kinh độ: {selectedRequest.longitude.toFixed(6)}
                    </p>
                  </div>
                )}

                {/* Urgency & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#4b5563',
                      marginBottom: '0.5rem'
                    }}>
                      ⚡ Mức độ ưu tiên
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      backgroundColor: '#fee2e2',
                      color: '#b91c1c',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      {getUrgencyLabel(selectedRequest.urgencyLevel)}
                    </div>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#4b5563',
                      marginBottom: '0.5rem'
                    }}>
                      📋 Trạng thái
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      {getStatusLabel(selectedRequest.status)}
                    </div>
                  </div>
                </div>

                {/* Creator Info */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#4b5563',
                    marginBottom: '0.5rem'
                  }}>
                    👤 Người gửi
                  </label>
                  <p style={{
                    backgroundColor: '#f3f4f6',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    color: '#1f2937'
                  }}>
                    {selectedRequest.userName}
                  </p>
                </div>

                {/* Team Info */}
                {selectedRequest.assignedTeamName && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#4b5563',
                      marginBottom: '0.5rem'
                    }}>
                      🚒 Đội cứu hộ
                    </label>
                    <p style={{
                      backgroundColor: '#f3f4f6',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      color: '#1f2937'
                    }}>
                      {selectedRequest.assignedTeamName}
                    </p>
                  </div>
                )}

                {/* Created Time */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#4b5563',
                    marginBottom: '0.5rem'
                  }}>
                    🕐 Thời gian tạo
                  </label>
                  <p style={{
                    backgroundColor: '#f3f4f6',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    color: '#1f2937'
                  }}>
                    {new Date(selectedRequest.createdTime).toLocaleString('vi-VN')}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    marginTop: '1rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#6b7280';
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            Danh sách yêu cầu cứu hộ
          </h1>
          <p style={{ color: '#d1d5db' }}>
            Quản lý và theo dõi tất cả yêu cầu cứu hộ
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: filter === status ? '#2563eb' : '#e5e7eb',
                  color: filter === status ? 'white' : '#374151'
                }}
              >
                {status === 'ALL' ? 'Tất cả' : 
                 status === 'PENDING' ? 'Chờ xử lý' : 
                 status === 'ASSIGNED' ? 'Đã giao' : 
                 status === 'IN_PROGRESS' ? 'Đang xử lý' : 
                 'Hoàn thành'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '1rem'
          }}>
            <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Tổng yêu cầu
            </p>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#2563eb' }}>
              {requests.length}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '1rem'
          }}>
            <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Chưa xử lý
            </p>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#dc2626' }}>
              {requests.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '1rem'
          }}>
            <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Đang xử lý
            </p>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#eab308' }}>
              {requests.filter(r => r.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '1rem'
          }}>
            <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Hoàn thành
            </p>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#16a34a' }}>
              {requests.filter(r => r.status === 'COMPLETED').length}
            </p>
          </div>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '3rem',
              paddingBottom: '3rem'
            }}>
              <div style={{
                animation: 'spin 1s linear infinite',
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                borderWidth: '3px',
                borderStyle: 'solid',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderTopColor: 'white'
              }} />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                Không có yêu cầu cứu hộ nào
              </p>
            </div>
          ) : (
            filteredRequests.map((request: RescueRequest) => (
              <div
                key={request.requestId}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '1.5rem',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {/* Left - Description */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {/* Icon and Title */}
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: '#fee2e2',
                        fontSize: '1.25rem',
                        flexShrink: 0
                      }}>
                        {request.urgencyLevel === 'CRITICAL' || request.urgencyLevel === 'HIGH' ? '⚠️' : 'ℹ️'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          marginBottom: '0.5rem'
                        }}>
                          Yêu cầu #{request.requestId}
                        </h3>
                        <p style={{
                          color: '#4b5563',
                          marginBottom: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {request.description}
                        </p>

                        {/* Details */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                          fontSize: '0.875rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563' }}>
                            <span>📍</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {request.location}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563' }}>
                            <span>🕐</span>
                            <span>{new Date(request.createdTime).toLocaleString('vi-VN')}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563' }}>
                            <span>👤</span>
                            <span>{request.userName}</span>
                          </div>

                          {request.assignedTeamName && (
                            <div style={{ color: '#4b5563' }}>
                              <span style={{ fontWeight: '600' }}>Đội: </span>
                              {request.assignedTeamName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right - Status and Actions */}
                  <div style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '1rem'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5'
                      }}>
                        {getUrgencyLabel(request.urgencyLevel)}
                      </div>
                      <div style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af'
                      }}>
                        {getStatusLabel(request.status)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleViewDetails(request)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#1d4ed8';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#2563eb';
                        }}>
                          Xem chi tiết
                        </button>
                        {request.status === 'PENDING' && (
                          <button 
                            onClick={() => handleAccept(request)}
                            disabled={acceptingId === request.requestId}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: acceptingId === request.requestId ? '#9ca3af' : '#16a34a',
                              color: 'white',
                              borderRadius: '0.5rem',
                              border: 'none',
                              cursor: acceptingId === request.requestId ? 'not-allowed' : 'pointer',
                              fontWeight: '600',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (acceptingId !== request.requestId) {
                                (e.currentTarget as HTMLElement).style.backgroundColor = '#15803d';
                              }
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.backgroundColor =
                                acceptingId === request.requestId ? '#9ca3af' : '#16a34a';
                            }}>
                              {acceptingId === request.requestId ? 'Đang cập nhật...' : 'Chấp nhận'}
                            </button>
                        )}
                      </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
