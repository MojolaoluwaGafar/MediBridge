import { Download } from "lucide-react";
import Modal from "../../PortalComponents/Modal";
import Avatar from "../../PortalComponents/Avatar";
import Button from "../../Button";
import { RECORD_TYPE_LABELS, type IMedicalRecord } from "../../../types/record";
import { formatLongDate } from "../../../utils/formatDate";

type Props = {
  record: IMedicalRecord;
  onClose: () => void;
  onDownload: (record: IMedicalRecord) => void;
  downloading: boolean;
};

export default function RecordDetailsModal({ record, onClose, onDownload, downloading }: Props) {
  return (
    <Modal
      title={record.title}
      onClose={onClose}
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" content="Close" onClick={onClose} />
          <Button
            type="button"
            disabled={downloading}
            onClick={() => onDownload(record)}
            content={
              <span className="flex items-center justify-center gap-2">
                <Download size={18} />
                {downloading ? "Preparing…" : "Download PDF"}
              </span>
            }
          />
        </div>
      }
    >
      {record.doctor && (
        <div className="flex items-center gap-3 pb-5">
          <Avatar name={record.doctor.docName} image={record.doctor.docImg} size={48} />
          <div>
            <p className="fontOutfit font-medium">{record.doctor.docName}</p>
            <p className="text-sm text-[#605E5E]">{record.department} Department</p>
          </div>
        </div>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-[#E6E3E3] py-4 text-sm">
        <dt className="text-[#757575]">Type</dt>
        <dd>{RECORD_TYPE_LABELS[record.type]}</dd>
        <dt className="text-[#757575]">Date of visit</dt>
        <dd>{formatLongDate(record.visitDate)}</dd>
        <dt className="text-[#757575]">Department</dt>
        <dd>{record.department}</dd>
      </dl>

      {record.summary && (
        <section className="pt-4">
          <h3 className="fontOutfit pb-1 font-medium text-[#28574E]">Summary</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed">{record.summary}</p>
        </section>
      )}

      {record.sections.map((section) => (
        <section key={section.heading} className="pt-4">
          <h3 className="fontOutfit pb-1 font-medium text-[#28574E]">{section.heading}</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed">{section.body}</p>
        </section>
      ))}
    </Modal>
  );
}
