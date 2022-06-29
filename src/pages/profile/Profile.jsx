import React from "react";
import { Row, Typography, Avatar, Col } from "antd";
import { useSelector } from "react-redux";
import styles from "./Profile.module.css";
import { useQuery } from "react-query";
import CumpusApi from "../../API/Cumpus";
import majorAPI from "../../API/majorAPi";

const { Title } = Typography;

const Profile = () => {
  const { infoUser } = useSelector((state) => state.auth);

  const idCampus = infoUser?.manager?.campus_id;
  const idMajor = infoUser?.student?.campus_id;

  const {
    data: {
      data: { cumpus },
    },
  } = useQuery("todos", () => {
    return CumpusApi.get(idCampus);
  });

  const {
    data: {
      data: { major },
    },
  } = useQuery("todos", () => {
    return majorAPI.get(idMajor);
  });

  return (
    <>
      <Title level={2}>Thông tin tài khoản</Title>
      <Row>
        <Col span={6}>
          <Avatar
            style={{ marginTop: 30 }}
            shape="square"
            size={{ xs: 50, sm: 70, md: 100, lg: 120, xl: 150, xxl: 200 }}
            src={infoUser?.picture}
          />
        </Col>
        <Col span={18} style={{ paddingTop: 30 }}>
          <Row>
            <Col size={6}>
              <span className={styles.titleInfo}>Name:</span>
            </Col>
            <Col size={18}>
              <span className={styles.textInfo} style={{ paddingLeft: 20 }}>
                {infoUser?.name}
              </span>
            </Col>
          </Row>
          <Row>
            <Col size={6}>
              <span className={styles.titleInfo}>Email:</span>
            </Col>
            <Col size={18}>
              <span className={styles.textInfo} style={{ paddingLeft: 20 }}>
                {infoUser?.isAdmin
                  ? infoUser?.manager?.email
                  : infoUser?.student?.email}
              </span>
            </Col>
          </Row>
          <Row>
            <Col size={6}>
              <span className={styles.titleInfo}>
                {infoUser?.isAdmin ? "Cơ sở làm việc:" : "Cơ sở học tập :"}
              </span>
            </Col>
            <Col size={18}>
              <span className={styles.textInfo} style={{ paddingLeft: 20 }}>
                {cumpus?.name}
              </span>
            </Col>
          </Row>
          {!infoUser?.isAdmin && (
            <>
              <Row>
                <Col size={6}>
                  <span className={styles.titleInfo}>Mã số sinh viên:</span>
                </Col>
                <Col size={18}>
                  <span className={styles.textInfo} style={{ paddingLeft: 20 }}>
                    {infoUser?.student?.mssv}
                  </span>
                </Col>
              </Row>
              <Row>
                <Col size={6}>
                  <span className={styles.titleInfo}>Chuyên ngành học:</span>
                </Col>
                <Col size={18}>
                  <span className={styles.textInfo} style={{ paddingLeft: 20 }}>
                    {major?.name}
                  </span>
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </>
  );
};

export default Profile;
