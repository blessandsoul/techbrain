export interface IInquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  locale: string;
  createdAt: string;
}

export interface InquiryFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateInquiryRequest {
  name: string;
  phone: string;
  message: string;
}
