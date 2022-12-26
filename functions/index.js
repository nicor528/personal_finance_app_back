
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { DateTime } = require("luxon");
const fecha_hoy = DateTime.now();

admin.initializeApp();
const db = admin.firestore();

exports.crearRegistro = functions.firestore
    .document('agregados/{id}')
    .onCreate(async (snap, context) => {
        const values = await snap.data();
        const valor = await values.valor;
        const titulo = await values.titulo;
        const tipo = await values.tipo;
        const mes = await values.mes;
        const path = "ingresos y gastos/" + mes + "/" + tipo + "/" + titulo
        console.log(fecha_hoy)
        await db.doc(path).set({valor : valor})
    })

exports.actualizarTotal_IyG = functions.firestore
    .document('ingresos y gastos/{mes}/{ingresoOgasto}/{documento}')
    .onCreate(async (snap, context) => {
        const values = await snap.data();
        const valor = await values.valor
        const mes = await context.params.mes
        const tipo = await context.params.ingresoOgasto
        const id = await context.params.documento
        const path = "ingresos y gastos/" + mes + "/" + tipo
        const pathT= path + "/Total"
        var total = 0;
        var resultados;
        //await console.log(mes, tipo, id)
        await db.collection("logger").add({tipo: tipo, id: id, valor: values.valor})
        await db.collection(path).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {                
                const data = doc.data();
                if(doc.id != "Total"){
                    total = total + data.valor
                }
                console.log(doc.id, " => ", doc.data(), total);
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });

        await db.doc(pathT).set({valor: total});

})