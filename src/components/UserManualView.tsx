import React from "react";
import { BookOpen, Calendar, Clock, Laptop, ShieldCheck, Mail, HelpCircle, PhoneCall } from "lucide-react";
import { Language } from "../locales";

interface UserManualViewProps {
  lang: Language;
}

export default function UserManualView({ lang }: UserManualViewProps) {
  const isTh = lang === "th";

  return (
    <div className="flex-grow flex flex-col p-6 overflow-y-auto custom-scrollbar select-none">
      <div className="max-w-4xl mx-auto w-full space-y-8 pb-10">
        
        {/* Header */}
        <div className="text-center md:text-left">
          <h2 className="font-display font-extrabold text-3xl text-primary mb-2 flex items-center justify-center md:justify-start gap-2.5">
            <BookOpen className="w-8 h-8 text-primary" />
            {isTh ? "คู่มือการใช้งานระบบ" : "User Manual & Guidelines"}
          </h2>
          <p className="font-sans text-sm text-on-surface-variant/90">
            {isTh 
              ? "คู่มือและคำแนะนำในการจองห้องประชุมและข้อควรปฏิบัติสำหรับพนักงาน DN Center" 
              : "Guidelines and instructions for booking meeting rooms at DN Center"}
          </p>
        </div>

        {/* Core Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: How to book */}
          <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-[0px_4px_15px_rgba(0,0,0,0.01)] hover:border-primary/20 transition-all space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-on-surface">
              {isTh ? "1. ขั้นตอนการจองห้องประชุม" : "1. How to Book a Room"}
            </h3>
            <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed list-decimal list-inside">
              <li>{isTh ? "เลือกแท็บ 'ค้นหาห้องประชุม' เพื่อดูรายละเอียดห้องและสิ่งอำนวยความสะดวก" : "Go to 'Explore Rooms' to view room specs and facilities."}</li>
              <li>{isTh ? "คลิกปุ่ม 'จองห้องนี้' หรือกดจองด่วนจากแถบเวลากลาง" : "Click 'Book Room' or make a quick booking on the timeline."}</li>
              <li>{isTh ? "ระบุหัวข้อประชุม วันที่ เวลา และเลือกรูปแบบ (On-site หรือ Online)" : "Enter the meeting title, date, time, and format (On-site or Online)."}</li>
              <li>{isTh ? "เชิญเพื่อนร่วมงานเข้าร่วมประชุมโดยการเพิ่มอีเมล" : "Invite colleagues by entering their email addresses."}</li>
              <li>{isTh ? "กดยืนยันการจอง ระบบจะส่งคำเชิญเข้าเมลทันที" : "Click Confirm. An email invitation will be sent automatically."}</li>
            </ul>
          </div>

          {/* Card 2: Online platform */}
          <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-[0px_4px_15px_rgba(0,0,0,0.01)] hover:border-primary/20 transition-all space-y-4">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-on-surface">
              {isTh ? "2. การเชื่อมต่อประชุมออนไลน์" : "2. Online Meeting Integration"}
            </h3>
            <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed list-disc list-inside">
              <li>{isTh ? "ระบบรองรับการจองพร้อมลิงก์ Zoom, Teams, และ Google Meet" : "Supports dynamic link generation for Zoom, Teams, and Meet."}</li>
              <li>{isTh ? "ลิงก์เข้าห้องประชุมและ Meeting ID จะถูกแนบไปกับอีเมลเชิญประชุม" : "Links and Meeting IDs are attached to your email invitation."}</li>
              <li>{isTh ? "ผู้เชิญสามารถกดปุ่ม 'เข้าร่วมผ่าน...' ได้โดยตรงในหน้า 'การจองทั้งหมด'" : "Click 'Join via...' directly from the 'All Bookings' tab."}</li>
            </ul>
          </div>

          {/* Card 3: Support */}
          <div className="bg-white p-6 rounded-3xl border border-outline-variant/60 shadow-[0px_4px_15px_rgba(0,0,0,0.01)] hover:border-primary/20 transition-all space-y-4">
            <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-on-surface">
              {isTh ? "3. ติดต่อฝ่ายบริการ IT / อุปกรณ์" : "3. Technical Support & IT Services"}
            </h3>
            <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed list-disc list-inside">
              <li>{isTh ? "พบปัญหาเรื่องอุปกรณ์ในห้อง (TV, ไมโครโฟน, สายต่อ) โทร. 1101 (เบอร์ภายใน)" : "IT Support hotline for in-room equipment issues: Ext. 1101"}</li>
              <li>{isTh ? "ส่งคำร้องขอสิ่งอำนวยความสะดวกเสริม หรือจัดชุดเบรคที่: support@dncenter.co.th" : "Send requests for extra catering or assets to: support@dncenter.co.th"}</li>
              <li>{isTh ? "ติดต่อแอดมินระบบไลน์ไอดีแอดมิน: @dn-it-support" : "Reach our system administrators on LINE: @dn-it-support"}</li>
            </ul>
          </div>

        </div>

        {/* Notice Banner */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-primary select-none">
              {isTh ? "นโยบายการประหยัดพลังงาน" : "Energy Saving & Environmental Policy"}
            </h4>
            <p className="text-xs text-on-surface-variant/90 leading-relaxed">
              {isTh 
                ? "กรุณาปิดสวิตช์ไฟ เครื่องปรับอากาศ และหน้าจอดิจิทัลทุกครั้งก่อนออกจากห้องประชุม เพื่อลดการปล่อยคาร์บอนและช่วยประหยัดพลังงานตามนโยบาย DN Center Eco-Office"
                : "Please turn off all lights, air conditioners, and display screens before leaving the room to support our DN Center Eco-Office policy."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
