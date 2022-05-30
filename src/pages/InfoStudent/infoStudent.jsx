import { Col, Row, Table } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { bool, object } from "prop-types";
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { getBusiness } from "../../features/businessSlice/businessSlice";
import { getStudentId } from "../../features/StudentSlice/StudentSlice";
import { getTimeForm } from "../../features/timeDateSlice/timeDateSlice";
import { optionStatus } from "../../ultis/selectOption";
const columns = [
  {
    title: "Tên doanh nghiệp",
    dataIndex: "name",
  },
  {
    title: "Vị trí TT",
    dataIndex: "internshipPosition",
  },
  {
    title: "Số lượng",
    dataIndex: "amount",
  },
  {
    title: "Address",
    dataIndex: "address",
  },
  {
    title: "Ngành",
    dataIndex: "majors",
  },
];
function InfoStudent({
  studentById,
  infoUser,
  listBusiness: { list, total },
  loading,
  time
}) {
  const [page, setPage] = useState({
    page: 1,
    limit: 5,
    campus_id: infoUser.student.campus_id,
    smester_id: infoUser.student.smester_id,
    majors: infoUser.student.majors,
  });
  const [dateNow] = useState(Date.now());
  const [value] = useState(4);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getTimeForm(value));
    dispatch(getStudentId(infoUser.student.mssv));
    dispatch(getBusiness(page));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, infoUser]);
  const isRegister = studentById?.support;
  const statusForm = studentById?.statusCheck;
  return (
    <div>
      <Row>
        <Col span={12} className=" border-end p-3">
          <div>
            <h4>Thông tin đăng ký</h4>
          </div>
          <div className="border-top mt-3 pt-2">
            <p>Họ và tên : {studentById.name}</p>
            <p>Ngành : {studentById.majors}</p>
            <p>Khóa học : {studentById.course}</p>
            <p>Email : {studentById.email}</p>
            <p>
              Lựa chọn :{" "}
              {isRegister === 0
                ? "Tự tìm nơi thực tập"
                : "" || isRegister === 1
                ? "Nhận hỗ trợ từ nhà trường"
                : ""}
            </p>
            <p>
              {" "}
              Công ty đã chọn:{" "}
              {studentById.support === 1
                ? studentById?.business?.name
                : studentById?.nameCompany}{" "}
            </p>
            <p>
              Trạng thái SV :{" "}
              {/* eslint-disable-next-line array-callback-return */}
              {optionStatus.map((index) => {
                if (index.value === statusForm) {
                  return index.title;
                }
              })}{" "}
            </p>
          </div>
        </Col>
        <Col span={12} className="p-3">
          <h4>Chọn công ty</h4>
          {time?.startTime <= dateNow && dateNow <= time.endTime ? (
            <div>
              <Table
                loading={loading}
                rowKey="_id"
                columns={columns}
                dataSource={list}
                pagination={{
                  pageSize: page.limit,
                  total: total,
                  onChange: (pages, pageSize) => {
                    setPage({
                      ...page,
                      page: pages,
                      limit: pageSize,
                      campus_id: infoUser.student.cumpus,
                    });
                  },
                }}
              />
            </div>
          ) : (
            <span>Chưa có thông tin công ty thực tập.</span>
          )}
        </Col>
      </Row>
      <Row>
        <Col span={24} className=" mt-2 border-top ms-2">
          <h4 className="mt-2">Ghi chú</h4>
          <TextArea
            disabled={true}
            rows={10}
            value={studentById.note}
            className="text-dark"
          ></TextArea>
        </Col>
      </Row>
    </div>
  );
}
InfoStudent.propTypes = {
  studentById: object,
  infoUser: object,
  listBusiness: object,
  loading: bool,
  time: object,
};

export default connect(
  ({
    students: { studentById },
    auth: { infoUser },
    business: { listBusiness, loading },
    time: {formTime:{time}}
  }) => ({
    studentById,
    infoUser,
    listBusiness,
    loading,
    time
  })
)(InfoStudent);
