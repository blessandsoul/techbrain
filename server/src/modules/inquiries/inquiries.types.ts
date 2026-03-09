/**
 * Inquiries Module — Types
 *
 * Response and filter interfaces for inquiries.
 */

export interface InquiryResponse {
  id: string;
  name: string;
  phone: string;
  message: string;
  locale: string;
  createdAt: string;
}

export interface InquiryFilters {
  search?: string;
}
