import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Image, TextInput, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  List,
  Menu,
  Text,
} from "react-native-paper";
import { useMemberHandler } from "../../../authentication/MemberHandler";
import { useWixSession } from "../../../authentication/session";
import { wixCient } from "../../../authentication/wixClient";
import { DismissKeyboardScrollView } from "../../../components/DismissKeyboardHOC/DismissKeyboardScrollView";
import { ErrorView } from "../../../components/ErrorView/ErrorView";
import { LoadingIndicator } from "../../../components/LoadingIndicator/LoadingIndicator";
import { styles } from "../../../styles/members/styles";
import { usePrice } from "../../store/price";

const FormInput = ({ labelValue, placeholderText, inputValue, ...rest }) => {
  return (
    <View style={styles.accountInputContainer}>
      <Text style={styles.accountInfoText}>{labelValue}:</Text>
      <TextInput
        style={styles.accountInput}
        placeholder={placeholderText}
        {...rest}
        value={inputValue}
      />
    </View>
  );
};

const MemberForm = () => {
  const { firstName, lastName, phone, updateContact } = useMemberHandler();
  const queryClient = useQueryClient();

  const member = queryClient.getQueryData(["currentMember"])?.member;
  return (
    <View style={styles.accountInfo}>
      <Text style={styles.accountInfoTitle}>Account</Text>
      <Text style={styles.accountInfoSubtitle}>
        Update your personal information.
      </Text>
      <Text style={styles.accountInfoText}>Login Email:</Text>
      <Text style={styles.accountInfoText}>
        {member?.loginEmail || "No email found"}
      </Text>
      <Text style={styles.accountInfoSmallText}>
        Your Login email can't be changed.
      </Text>
      <FormInput
        inputValue={firstName}
        labelValue={"First Name"}
        placeholderText={"First Name"}
        onChangeText={(text) =>
          updateContact({ firstName: text, lastName, phone })
        }
      />
      <FormInput
        inputValue={lastName}
        labelValue={"Last Name"}
        placeholderText={"Last Name"}
        onChangeText={(text) =>
          updateContact({ lastName: text, firstName, phone })
        }
      />
      <FormInput
        inputValue={phone}
        labelValue={"Phone"}
        placeholderText={"Phone"}
        onChangeText={(text) =>
          updateContact({ phone: text, firstName, lastName })
        }
        keyboardType={"phone-pad"}
      />
    </View>
  );
};

const Orders = () => {
  const { session } = useWixSession();

  const myOrdersQuery = useQuery(["my-orders", session], async () => {
    const res = await wixCient.fetchWithAuth(
      `https://www.wixapis.com/stores/v2/orders/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {},
        }),
      },
    );
    return res.json();
  });

  if (myOrdersQuery.isLoading) {
    return <LoadingIndicator />;
  }

  if (myOrdersQuery.isError) {
    return <ErrorView message={myOrdersQuery.error.message} />;
  }

  return (
    <List.Accordion
      title={"My Orders"}
      style={styles.membersOrders}
      titleStyle={{
        fontSize: 20,
        color: "#403f2b",
      }}
      right={(props) => (
        <List.Icon
          {...props}
          icon={`chevron-${props.isExpanded ? "up" : "down"}`}
          color={"#403f2b"}
          style={styles.ordersShowMoreIcon}
        />
      )}
    >
      {myOrdersQuery.data.orders.map((order) => {
        return (
          <View key={order.id}>
            <List.Item
              key={order.id}
              contentStyle={{
                flexGrow: 1,
                width: "100%",
              }}
              title={`Order number #${order.number}`}
              titleStyle={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#403f2b",
              }}
              description={
                <View>
                  <Text />
                  <Text>
                    Date: {format(new Date(order.dateCreated), "MMM dd, yyyy")}
                  </Text>
                  <Text>
                    Status:{" "}
                    {
                      {
                        FULFILLED: "Fulfilled",
                        NOT_FULFILLED: "Not Fulfilled",
                        PARTIALLY_FULFILLED: "Partially Fulfilled",
                        CANCELLED: "Cancelled",
                      }[order.fulfillmentStatus]
                    }
                  </Text>
                  <Text>
                    Payment Status:
                    {
                      {
                        PAID: "Paid",
                        NOT_PAID: "Not Paid",
                        PARTIALLY_PAID: "Partially Paid",
                        REFUNDED: "Refunded",
                      }[order.paymentStatus]
                    }
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#fdfbef",
                    }}
                  >
                    <List.Accordion
                      title={"Items"}
                      style={{
                        backgroundColor: "#fdfbef",
                      }}
                      titleStyle={{
                        marginHorizontal: -15,
                        width: "100%",
                      }}
                      descriptionStyle={{
                        padding: 0,
                        marginHorizontal: -15,
                        marginVertical: 50,
                      }}
                      theme={{
                        colors: {
                          primary: "#403f2b",
                          text: "#403f2b",
                        },
                      }}
                    >
                      {order.lineItems.map((item, index) => (
                        <List.Item
                          key={item.id + index}
                          title={
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                height: 60,
                              }}
                            >
                              <View>
                                <Image
                                  source={{
                                    uri:
                                      item.mediaItem?.url ??
                                      `https://via.placeholder.com/50`,
                                  }}
                                  style={{
                                    width: 60,
                                    height: 60,
                                  }}
                                />
                              </View>
                              <View
                                style={{
                                  paddingHorizontal: 10,
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
                              >
                                <Text
                                  variant="titleSmall"
                                  style={{
                                    color: "#403f2b",
                                    flex: 1,
                                  }}
                                >
                                  {item.name}
                                </Text>
                                <Text>Quantity: {item.quantity}</Text>
                                <Text>
                                  Price:{" "}
                                  {usePrice({
                                    amount: Number.parseFloat(item.totalPrice),
                                    currencyCode: order.currency,
                                  })}
                                </Text>
                              </View>
                            </View>
                          }
                        />
                      ))}
                    </List.Accordion>
                  </View>
                  <Text />
                  <Text>
                    Total:{" "}
                    {usePrice({
                      amount: Number.parseFloat(order.totals.total),
                      currencyCode: order.currency,
                    })}
                  </Text>
                </View>
              }
            />
            <Divider />
          </View>
        );
      })}
      {!myOrdersQuery.data.orders.length && (
        <Text style={styles.orderDetails}>You have no orders yet.</Text>
      )}
    </List.Accordion>
  );
};
export const MemberView = () => {
  const queryClient = useQueryClient();
  const { newVisitorSession } = useWixSession();
  const { firstName, lastName, phone, updateContact } = useMemberHandler();
  const [visibleMenu, setVisibleMenu] = useState(false);
  const getCurrentMemberRes = useQuery(["currentMember"], () =>
    wixCient.members.getCurrentMember({ fieldSet: "FULL" }),
  );
  const [currentMember, setCurrentMember] = useState(null);

  useEffect(() => {
    const fetchCurrentMember = async () => {
      const { member } = await wixCient.members.getCurrentMember({
        fieldSet: "FULL",
      });
      updateContact({
        firstName: member?.contact?.firstName,
        lastName: member?.contact?.lastName,
        phone: member?.contact?.phones[0],
      });
      setCurrentMember(member);
    };
    fetchCurrentMember();
  }, []);

  const updateMemberMutation = useMutation(
    async () => {
      if (!currentMember) return;
      const contact = currentMember?.contact;
      const newPhones = [...(contact?.phones || [])];
      newPhones[0] = phone;
      const updatedContact = {
        ...(contact || {}),
        firstName,
        lastName,
        phones: newPhones,
      };
      const updatedMember = {
        contact: updatedContact,
      };
      return await wixCient.members.updateMember(
        currentMember?._id,
        updatedMember,
      );
    },
    {
      onSuccess: async (response) => {
        const member = {
          member: {
            ...response,
          },
        };
        queryClient.setQueryData(["currentMember"], member);
        setCurrentMember(response);
      },
    },
  );

  if (getCurrentMemberRes.isError) {
    return <ErrorView message={getCurrentMemberRes.error.message} />;
  }

  if (getCurrentMemberRes.isLoading || !currentMember) {
    return <LoadingIndicator />;
  }

  if (updateMemberMutation.isLoading) {
    return <LoadingIndicator loadingMessage={"Updating your info..."} />;
  }

  const { profile, contact } = currentMember || {};

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DismissKeyboardScrollView
        style={styles.contentSection}
        keyboardShouldPersistTaps="never"
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        bouncesZoom={false}
        automaticallyAdjustKeyboardInsets={true}
        scrollEventThrottle={16}
      >
        <View style={styles.memberHeader} />
        <View style={styles.memberSection}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            {profile?.photo?.url ? (
              <Avatar.Image
                size={100}
                theme={{ colors: { primary: "#403f2b" } }}
                source={{
                  uri: profile?.photo?.url,
                }}
              />
            ) : (
              <Avatar.Text
                size={100}
                label={
                  contact?.firstName && contact?.lastName
                    ? `${contact?.firstName[0]}${contact?.lastName[0]}`
                    : profile?.nickname[0]
                }
              />
            )}
            <Menu
              visible={visibleMenu}
              onDismiss={() => setVisibleMenu(false)}
              anchor={
                <IconButton
                  icon={"dots-vertical"}
                  iconColor={"#403f2b"}
                  size={30}
                  onPress={() => setVisibleMenu(!visibleMenu)}
                  style={{ backgroundColor: "#fdfbef" }}
                />
              }
              contentStyle={{
                backgroundColor: "#fdfbef",
                padding: 10,
                marginTop: 40,
              }}
              theme={{ colors: { text: "#403f2b" } }}
            >
              <Menu.Item
                leadingIcon="logout"
                onPress={async () => {
                  await newVisitorSession();
                }}
                title="Signout"
              />
            </Menu>
          </View>
          <Text
            style={{
              fontSize: 20,
              marginTop: 20,
              color: "#403f2b",
            }}
          >
            {contact?.firstName && contact?.lastName
              ? `${contact?.firstName} ${contact?.lastName}`
              : profile?.nickname}
          </Text>
        </View>
        <View style={{ marginTop: 20, width: "100%" }}>
          <Orders />
        </View>
        <View style={styles.memberDetails}>
          <Text style={styles.memberDetailsTitle}>My Account</Text>
          <Text style={styles.memberDetailsSubTitle}>
            View and edit your personal info below.
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 10,
              width: "100%",
              marginTop: 20,
            }}
          >
            <Button
              mode="outlined"
              onPress={() => {
                updateContact({
                  firstName: contact?.firstName,
                  lastName: contact?.lastName,
                  phone: contact?.phones[0],
                });
              }}
              style={styles.memberActionButton}
              labelStyle={{ fontFamily: "Fraunces-Regular", fontSize: 16 }}
              theme={{ colors: { primary: "#403f2b" } }}
            >
              Discard
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                updateMemberMutation.mutate();
              }}
              style={styles.memberActionButton}
              labelStyle={{ fontFamily: "Fraunces-Regular", fontSize: 16 }}
              theme={{
                colors: { primary: "#403f2b" },
                fonts: { fontFamily: "Fraunces-Regular" },
              }}
            >
              Update Info
            </Button>
          </View>
          <MemberForm />
        </View>
      </DismissKeyboardScrollView>
    </GestureHandlerRootView>
  );
};
