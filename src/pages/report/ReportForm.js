import { UploadOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  message,
  Spin,
  Space,
  DatePicker,
  Upload,
  InputNumber,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReportFormAPI from "../../API/ReportFormAPI";
import CountDownCustorm from "../../components/CountDownCustorm";
import { getStudentId } from "../../features/cumpusSlice/cumpusSlice";
import { getTimeForm } from "../../features/timeDateSlice/timeDateSlice";

import styles from "./ReportForm.module.css";

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

const ReportForm = () => {
  const { time } = useSelector((state) => state.time.formTime);
  const [spin, setSpin] = useState(false);
  const [file, setFile] = useState();
  const [endDate, setEndDate] = useState();
  const [form] = Form.useForm();
  const { infoUser } = useSelector((state) => state.auth);
  const { student } = useSelector((state) => state.cumpus);
  const mssv = infoUser.student.mssv;
  const email = infoUser.student.email;
  const lForm = infoUser.student.form;
  const dispatch = useDispatch();
  const datePicker = (date, dateString) => {
    setEndDate(date._d);
  };
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
          const newData = { ...data, report: a.url };
          ReportFormAPI.uploadReport(newData)
            .then((res) => {
              message.success(res.data.message);
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

  const normFile = (e) => {
    const valueFile = e.file.originFileObj.type;
    const isFile = valueFile;

    if (
      isFile === "application/pdf" ||
      isFile ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      setFile(e.file.originFileObj);
    } else {
      form.resetFields();
      message.error("Vui lòng nhập file đúng định dạng PDF hoặc .docx");
    }
  };
  useEffect(() => {
    dispatch(getTimeForm(3));
    dispatch(getStudentId(infoUser.student.mssv));
  }, [infoUser]);

  const onFinish = async (values) => {
    setSpin(true);

    try {
      const newData = {
        ...values,
        EndInternShipTime: endDate,
        nameCompany: student.nameCompany,
        mssv: mssv,
        typeNumber: time.typeNumber,
        email: email,
      };
      await guardarArchivo(file, newData);
    } catch (error) {
      const dataErr = await error.response.data;
      message.error(dataErr.message);
    }
    setSpin(false);
  };

  const check = time.endTime > new Date().getTime();
  const isCheck = student.statusCheck === 6 || student.statusCheck === 8;
  const dateFormat = "YYYY-MM-DD";
  console.log(student.internshipTime);
  return (
    <>
      {spin ? <Spin /> : null}
      {check && <CountDownCustorm time={time} />}
      {check ? (
        isCheck ? (
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
            <Form.Item name="nameCompany" label="Tên doanh nghiệp">
              <Input
                defaultValue={student.nameCompany}
                disabled
                placeholder="Tên doanh nghiệp"
              />
            </Form.Item>

            <Form.Item
              label="Thời gian bắt đầu thực tập"
              // rules={[{}]}
            >
              <Space direction="vertical">
                <DatePicker
                  defaultValue={moment(student.internshipTime, dateFormat)}
                  disabled
                  placeholder="Bắt đầu thực tập"
                />
              </Space>
            </Form.Item>
            <Form.Item
              name="EndInternshipTime"
              label="Thời gian kết thúc thực tập"
              // rules={[{}]}
            >
              <Space direction="vertical">
                <DatePicker
                  onChange={datePicker}
                  placeholder="Kết thúc thực tập"
                />
              </Space>
            </Form.Item>
            <Form.Item
              name="attitudePoint"
              label="Điểm thái độ"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập điểm thái độ",
                },
              ]}
            >
              <InputNumber
                style={{
                  width: "50%",
                }}
                min={0}
                max={10}
                placeholder="Nhập điểm thái độ thực tập"
              />
            </Form.Item>

            <Form.Item
              name="resultScore"
              label="Điểm kết quả"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập điểm kết quả thực tập",
                },
              ]}
            >
              <InputNumber
                style={{
                  width: "50%",
                }}
                min={0}
                max={10}
                placeholder="Nhập điểm kết quả thực tập"
              />
            </Form.Item>
            <Form.Item
              name="upload"
              label="Upload báo cáo (Docx hoặc PDF)"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload name="logo" action="/upload.do" listType="picture">
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button
                style={{
                  margin: "0 5px 0",
                }}
                type="link"
                onClick={() => window.open(lForm)}
              >
                Xem biểu mẫu
              </Button>
            </Form.Item>
          </Form>
        ) : (
          "Bạn đã nộp báo cáo thành công"
        )
      ) : (
        <p>Chưa đến thời gian nộp báo cáo</p>
      )}
    </>
  );
};

export default ReportForm;
