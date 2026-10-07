# ------------------ LÓGICA ---------------------------------------


def calcular_media(notas):
    media = sum(notas) / len(notas)
    return round(media, 2)

def verificar_status(media):
    return "Aprovado" if media >= 5 else "Reprovado"