import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import InputSpinner from "react-native-input-spinner";
import { WixMediaImage } from "../../WixMediaImage";
import { ActivityIndicator, IconButton } from "react-native-paper";

export const CartListItem = ({
  image,
  name,
  price,
  quantity,
  quantityOnEdit,
  quantityHandlerChange,
  removeHandler,
}) => {
  const [newQuantity, setNewQuantity] = React.useState(quantity);
  useEffect(() => {
    setNewQuantity(quantity);
  }, [quantity]);
  return (
    <View style={{ width: "100%" }}>
      <View style={styles.card}>
        <WixMediaImage media={image} width={80} height={110}>
          {({ url }) => <Image source={{ uri: url }} style={styles.image} />}
        </WixMediaImage>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.price}>{price}</Text>
        </View>

        <View style={styles.close}>
          <IconButton
            icon={"close"}
            onPress={removeHandler}
            iconColor={"#908e80"}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          margin: 10,
          width: "100%",
        }}
      >
        <View style={{ flex: 1 }} />
        <View
          style={{
            flex: 2,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            width: "100%",
          }}
        >
          {quantityOnEdit && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: -10,
                width: "100%",
                height: "100%",
                zIndex: 100,
              }}
            >
              <ActivityIndicator
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              />
            </View>
          )}
          <InputSpinner
            value={newQuantity}
            width={100}
            height={40}
            onChange={(quantity) => {
              setNewQuantity(quantity);
              quantityHandlerChange(quantity);
            }}
            rounded={false}
            showBorder={true}
            buttonStyle={{ width: 30 }}
            min={1}
            containerStyle={{
              backgroundColor: "transparent",
              borderColor: "#908e80",
              opacity: quantityOnEdit ? 0.5 : 1,
            }}
          />
          <Text style={[styles.price, { opacity: quantityOnEdit ? 0.5 : 1 }]}>
            {price}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: "transparent",
    margin: 10,
    elevation: 2,
    position: "relative",
  },
  close: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  image: {
    width: 80,
    height: 110,
    resizeMode: "cover",
    borderColor: "#908e80",
    borderWidth: 2,
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 18,
    maxWidth: "75%",
    color: "#403f2b",
  },
  price: {
    fontSize: 16,
    color: "#403f2b",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    height: 30,
    width: 50,
    borderColor: "#908e80",
    borderWidth: 1,
    marginLeft: 5,
    paddingHorizontal: 5,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
    width: "100%",
  },
});
