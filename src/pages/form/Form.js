import { UploadOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Spin,
  Space,
  DatePicker,
} from "antd";
import { object } from "prop-types";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import ReportFormAPI from "../../API/ReportFormAPI";
import CountDownCustorm from "../../components/CountDownCustorm";
import { getStudentId } from "../../features/StudentSlice/StudentSlice";
import { getTimeForm } from "../../features/timeDateSlice/timeDateSlice";
import { getLocal } from "../../ultis/storage";

import styles from "./Form.module.css";

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};
const Formrp = ({ studentById }) => {
  const infoUser = getLocal();
  const { time } = useSelector((state) => state.time.formTime);
  const [spin, setSpin] = useState(false);
  const [startDate, setStartDate] = useState();
  const [file, setFile] = useState();
  const [form] = Form.useForm();

  const mssv = infoUser.student?.mssv;
  const email = infoUser?.student?.email;
  const dispatch = useDispatch();
  const datePicker = (date, dateString) => {
    setStartDate(date._d);
  };
  useEffect(() => {
    dispatch(
      getTimeForm({
        typeNumber: 2,
        semester_id: infoUser.student.smester_id,
      })
    );
    dispatch(getStudentId(infoUser.student.mssv));
  }, [file]);
  function guardarArchivo(files, data) {
    const file = files; //the file
    const urlGGDriveCV = `https://script.google.com/macros/s/AKfycbzu7yBh9NkX-lnct-mKixNyqtC1c8Las9tGixv42i9o_sMYfCvbTqGhC5Ps8NowC12N/exec
     `;

    var reader = new FileReader(); //this for convert to Base64
    reader.readAsDataURL(file); //start conversion...
    reader.onload = function (e) {
      //.. once finished..
      var rawLog = reader.result.split(",")[1]; //extract only thee file data part
      var dataSend = {
        dataReq: { data: rawLog, name: file.name, type: file.type },
        fname: "uploadFilesToGoogleDrive",
      }; //preapre info to send to API
      fetch(
        urlGGDriveCV, //your AppsScript URL
        { method: "POST", body: JSON.stringify(dataSend) }
      ) //send to Api
        .then((res) => res.json())
        .then((a) => {
          const newData = { ...data, form: a.url };
          ReportFormAPI.uploadForm(newData)
            .then((res) => {
              message.success(res.data.message);
              setFile("");
              form.resetFields();
            })
            .catch(async (err) => {
              const dataErr = await err.response.data;
              if (!dataErr.status) {
                message.error(`${dataErr.message}`);
                form.resetFields();
              } else {
                message.error(`${dataErr.message}`);
              }
            });
          setSpin(false);
        })
        .catch((e) => {
          message.success("Có lỗi xảy ra! Vui lòng đăng ký lại");
          form.resetFields();
          setSpin(false);
        }); // Or Error in console
    };
  }

  const props = {
    beforeUpload: (file) => {
      const isFile =
        file.type === "application/pdf" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg";
      if (!isFile) {
        message.error(`${file.name} không phải là file PDF hoặc ảnh`);
      }

      return isFile || Upload.LIST_IGNORE;
    },
    onChange: (info) => {
      setFile(info.file.originFileObj);
    },
  };

  
  let timeCheck = time;
  if (studentById.listTimeForm && studentById.listTimeForm.length > 0) {
    const checkTimeStudent = studentById.listTimeForm.find(
      (item) => item.typeNumber === 2
    );
    if (checkTimeStudent) {
      timeCheck = checkTimeStudent;
    }
  }
  const check =
    timeCheck &&
    timeCheck.endTime > new Date().getTime() &&
    timeCheck.startTime < new Date().getTime();
  const isCheck =
    (studentById && studentById.statusCheck === 2) ||
    studentById.statusCheck === 5;
  const nameCompany =
    studentById.support === 0 ? studentById.nameCompany : studentById.business;
    const onFinish = async (values) => {
      setSpin(true);
      try {
        const newData = {
          ...values,
          mssv: mssv,
          email: email,
          typeNumber: time.typeNumber,
          internshipTime: startDate,
          semester_id: infoUser.student.smester_id,
          checkTime: check,
        };
        await guardarArchivo(file, newData);
      } catch (error) {
        const dataErr = await error.response.data;
        message.error(dataErr.message);
      }
    };
  return (
    <>
      {check ? (
        isCheck ? (
          <>
            {" "}
            {check && <CountDownCustorm time={time} />}
            <Spin spinning={spin}>
              <Form
                {...formItemLayout}
                form={form}
                className={styles.form}
                name="register"
                onFinish={onFinish}
                initialValues={{
                  residence: ["zhejiang", "hangzhou", "xihu"],
                  prefix: "86",
                }}
                scrollToFirstError
              >
                {nameCompany ? null : (
                  <Form.Item
                    name="nameCompany"
                    label="Tên doanh nghiệp"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên doanh nghiệp",
                      },
                    ]}
                  >
                    <Input placeholder="Tên doanh nghiệp" />
                  </Form.Item>
                )}

                <Form.Item
                  // name="user_code"
                  label="Mã sinh viên"
                >
                  <p className={styles.text_form_label}>
                    {studentById.mssv.toUpperCase()}
                  </p>
                </Form.Item>

                <Form.Item label="Họ và Tên">
                  <p className={styles.text_form_label}>{studentById.name}</p>
                </Form.Item>
                <Form.Item
                  name="internshipTime"
                  label="Thời gian bắt đầu thực tập"
                  // rules={[{}]}
                >
                  <Space direction="vertical">
                    <DatePicker
                      onChange={datePicker}
                      placeholder="Bắt đầu thực tập"
                    />
                  </Space>
                </Form.Item>
                <Form.Item
                  name="upload"
                  label="Upload biên bản (Image or PDF)"
                  valuePropName="upload"
                >
                  <Upload {...props} maxCount={1}>
                    <Button icon={<UploadOutlined />}>Click to upload</Button>
                  </Upload>
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </>
        ) : !studentById.form ? (
          "Bạn phải đăng ký form trước trước"
        ) : (
          "Bạn đã nộp biên bản thành công."
        )
      ) : (
        <p>Chưa đến thời gian nộp biên bản</p>
      )}
    </>
  );
};
Formrp.propTypes = {
  infoUser: object,
  studentById: object,
};

export default connect(({ students: { studentById } }) => ({
  studentById,
}))(Formrp);
